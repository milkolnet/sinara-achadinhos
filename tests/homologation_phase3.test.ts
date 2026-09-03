import assert from 'assert';
import { formatBRL, calculateDiscount, detectPlatformFromUrl } from '../src/utils/platformHelper';
import { analyzeProductLink, isPrivateOrReservedIp } from '../server/linkAnalyzer';
import { validateAdminCredentials, generateToken, verifyToken } from '../server/auth';
import { dbService } from '../server/db';
import { hashClientIp } from '../server/security';

async function runHomologationTests() {
  console.log('🏁 [INICIANDO BATERIA DE HOMOLOGAÇÃO DA FASE 3 - SINARA ACHADINHOS]\n');
  let passed = 0;
  let failed = 0;

  const test = async (name: string, fn: () => Promise<void> | void) => {
    try {
      await fn();
      console.log(`  ✅ [PASS] ${name}`);
      passed++;
    } catch (err: any) {
      console.error(`  ❌ [FAIL] ${name}`);
      console.error(`     -> Detalhes: ${err.message}`);
      failed++;
    }
  };

  // 1. FORMAT BRL & DISCOUNT VALIDATION (Requirement 11)
  await test('Preço 0 deve retornar vazio ou não causar NaN no formatBRL', () => {
    const formatted = formatBRL(0);
    assert.strictEqual(formatted, '', 'Preço 0 deve retornar string vazia para fallback da UI');
    assert.strictEqual(formatBRL(undefined), '');
    assert.strictEqual(formatBRL(null), '');
    assert.strictEqual(formatBRL(NaN), '');
  });

  await test('Preço decimal longo (19.9999999) deve formatar corretamente em BRL', () => {
    const formatted = formatBRL(19.9999999);
    // In pt-BR, it should round to 2 decimals with comma
    assert.ok(formatted.includes('20,00') || formatted.includes('19,99') || formatted.includes('20'), `Formatado: ${formatted}`);
    assert.ok(!formatted.includes('NaN'));
  });

  await test('Preço normal formata com símbolo e duas casas decimais', () => {
    const formatted = formatBRL(89.9);
    assert.ok(formatted.includes('89,90'));
    assert.ok(formatted.includes('R$'));
  });

  await test('originalPrice menor que price não deve gerar desconto negativo', () => {
    const discount = calculateDiscount(100, 80);
    assert.strictEqual(discount, 0, 'Desconto deve ser zero quando originalPrice < price');
  });

  await test('calculateDiscount com valores válidos calcula porcentagem correta', () => {
    const discount = calculateDiscount(75, 100);
    assert.strictEqual(discount, 25);
  });

  await test('calculateDiscount com valores zerados ou inválidos retorna 0', () => {
    assert.strictEqual(calculateDiscount(0, 0), 0);
    assert.strictEqual(calculateDiscount(NaN, 100), 0);
    assert.strictEqual(calculateDiscount(100, NaN), 0);
  });

  // 2. LINK ANALYZER & AFFILIATE RETENTION (Requirements 5 & 13)
  await test('Detecção de Plataforma identifica Shopee, Amazon, Mercado Livre, Magalu', () => {
    assert.strictEqual(detectPlatformFromUrl('https://shopee.com.br/product/123'), 'shopee');
    assert.strictEqual(detectPlatformFromUrl('https://www.mercadolivre.com.br/item/123'), 'mercadolivre');
    assert.strictEqual(detectPlatformFromUrl('https://www.amazon.com.br/dp/B08N5WRWNW'), 'amazon');
    assert.strictEqual(detectPlatformFromUrl('https://www.magazineluiza.com.br/produto/123'), 'magalu');
  });

  await test('Analisador de Links preserva o link original de afiliado intacto como affiliateUrl', async () => {
    const affiliateUrl = 'https://www.amazon.com.br/dp/B08N5WRWNW?tag=sinara-20&linkCode=ll1';
    const analysis = await analyzeProductLink(affiliateUrl);
    assert.strictEqual(analysis.affiliateUrl, affiliateUrl, 'affiliateUrl DEVE ser idêntico ao link submetido');
    assert.ok(analysis.affiliateUrl.includes('tag=sinara-20'), 'Parâmetros de afiliado devem ser mantidos');
  });

  await test('Analisador de Links bloqueia SSRF contra localhost ou IP privado', async () => {
    const localUrl = 'http://127.0.0.1:8080/admin';
    const analysis = await analyzeProductLink(localUrl);
    assert.strictEqual(analysis.success, false);
    assert.ok(analysis.error?.includes('privado') || analysis.error?.includes('inválido') || analysis.error?.includes('bloqueado'));
  });

  // 3. AUTHENTICATION & SECURITY (Requirement 4)
  await test('Autenticação rejeita credenciais incorretas', () => {
    const user = validateAdminCredentials('admin', 'senha-completamente-errada-123');
    assert.strictEqual(user, null);
  });

  await test('Autenticação gera e valida JWT assinado', () => {
    const fakeAdmin = { username: 'admin', name: 'Sinara Admin', role: 'super_admin' as const };
    const token = generateToken(fakeAdmin);
    assert.ok(typeof token === 'string' && token.length > 20);

    const payload = verifyToken(token);
    assert.ok(payload !== null);
    assert.strictEqual(payload?.username, 'admin');
    assert.strictEqual(payload?.role, 'super_admin');
  });

  await test('Token adulterado ou expirado é rejeitado', () => {
    const fakeToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFkbWluIn0.invalida';
    const payload = verifyToken(fakeToken);
    assert.strictEqual(payload, null);
  });

  // 4. DATABASE OPERATIONS (Requirements 1, 6, 7, 8, 9, 10)
  await test('dbService lista produtos com campos essenciais', async () => {
    const products = await dbService.getProducts({ activeOnly: false });
    assert.ok(Array.isArray(products));
    assert.ok(products.length > 0, 'Deve conter produtos');
    const first = products[0];
    assert.ok(first.id, 'Produto deve ter ID');
    assert.ok(first.title, 'Produto deve ter título');
    assert.ok(first.affiliateUrl, 'Produto deve ter link de afiliado');
    assert.ok(first.platform, 'Produto deve ter plataforma');
  });

  await test('dbService permite criar, alternar status e excluir produto', async () => {
    const testProd = await dbService.createProduct({
      title: 'Produto Teste Homologação',
      affiliateUrl: 'https://shopee.com.br/test-affiliate-token',
      price: 49.9,
      originalPrice: 89.9,
      platform: 'shopee',
      category: 'casa',
    });

    assert.ok(testProd.id);
    assert.strictEqual(testProd.title, 'Produto Teste Homologação');
    assert.strictEqual(testProd.isActive, true);

    // Toggle active
    const toggled = await dbService.toggleProductActive(testProd.id);
    assert.strictEqual(toggled?.isActive, false);

    // Delete
    const deleted = await dbService.deleteProduct(testProd.id);
    assert.strictEqual(deleted, true);

    // Verify deleted
    const found = await dbService.getProductById(testProd.id);
    assert.strictEqual(found, undefined);
  });

  await test('dbService impede exclusão de categoria que possui produtos vinculados', async () => {
    const categories = await dbService.getCategories(false);
    const catWithProducts = categories.find((c) => (c.productCount || 0) > 0) || categories[0];
    assert.ok(catWithProducts, 'Deve existir ao menos uma categoria');

    const result = await dbService.deleteCategory(catWithProducts.id);
    assert.strictEqual(result.success, false, 'Não deve permitir excluir categoria com produtos');
    assert.ok(result.message?.includes('produtos associados'));
  });

  // 5. CLICK TRACKING & TELEMETRY (Requirements 13 & 14)
  await test('Rastreamento de clique incrementa clicksCount e registra evento com IP anonimizado', async () => {
    const products = await dbService.getProducts({ activeOnly: true });
    const product = products[0];
    const initialClicks = product.clicksCount || 0;

    const trackResult = await dbService.trackClick(product.id, product.platform, {
      ip: '201.55.12.34',
      userAgent: 'Mozilla/5.0 Test Suite',
      referrer: 'https://instagram.com',
    });

    assert.strictEqual(trackResult.success, true);
    assert.strictEqual(trackResult.clicksCount, initialClicks + 1);

    // Verify hash
    const ipHash = hashClientIp('201.55.12.34');
    assert.ok(ipHash.length === 16);
    assert.ok(!ipHash.includes('201.55.12.34'), 'IP não deve ser armazenado em texto puro');
  });

  // 6. HEALTH CHECK
  await test('dbService.checkHealth retorna status saudável', async () => {
    const health = await dbService.checkHealth();
    assert.strictEqual(health.healthy, true);
    assert.ok(['postgresql', 'json_persistence'].includes(health.engine));
  });

  console.log('\n==================================================');
  console.log(`TOTAL DE TESTES EXECUTADOS: ${passed + failed}`);
  console.log(`PASSOU: ${passed}`);
  console.log(`FALHOU: ${failed}`);
  console.log('==================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runHomologationTests().catch((err) => {
  console.error('[ERRO NA EXECUÇÃO DA BATERIA DE HOMOLOGAÇÃO]', err);
  process.exit(1);
});
