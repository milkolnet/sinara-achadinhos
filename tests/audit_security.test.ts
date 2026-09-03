import assert from 'assert';
import { isPrivateOrReservedIp, validateUrlSafety, analyzeProductLink } from '../server/linkAnalyzer';
import { hashPassword, verifyPassword, createRateLimiter } from '../server/security';

async function runTests() {
  console.log('🧪 [INICIANDO BATERIA DE TESTES DE SEGURANÇA E AUDITORIA]\n');
  let passed = 0;
  let failed = 0;

  const test = async (name: string, fn: () => Promise<void> | void) => {
    try {
      await fn();
      console.log(`  ✅ [PASS] ${name}`);
      passed++;
    } catch (err: any) {
      console.error(`  ❌ [FAIL] ${name}`);
      console.error(`     -> Erro: ${err.message}`);
      failed++;
    }
  };

  // 1. SSRF IP Checks
  await test('SSRF: Deve bloquear 127.0.0.1 (Loopback IPv4)', () => {
    assert.strictEqual(isPrivateOrReservedIp('127.0.0.1'), true);
  });

  await test('SSRF: Deve bloquear 0.0.0.0', () => {
    assert.strictEqual(isPrivateOrReservedIp('0.0.0.0'), true);
  });

  await test('SSRF: Deve bloquear 10.0.0.1 (Rede privada Classe A)', () => {
    assert.strictEqual(isPrivateOrReservedIp('10.0.0.1'), true);
  });

  await test('SSRF: Deve bloquear 172.16.0.1 e 172.31.255.254 (Rede privada Classe B)', () => {
    assert.strictEqual(isPrivateOrReservedIp('172.16.0.1'), true);
    assert.strictEqual(isPrivateOrReservedIp('172.25.10.5'), true);
    assert.strictEqual(isPrivateOrReservedIp('172.31.255.254'), true);
  });

  await test('SSRF: Deve bloquear 192.168.1.1 (Rede privada Classe C)', () => {
    assert.strictEqual(isPrivateOrReservedIp('192.168.1.1'), true);
  });

  await test('SSRF: Deve bloquear 169.254.169.254 (AWS/GCP/Azure Cloud Metadata & Link-Local)', () => {
    assert.strictEqual(isPrivateOrReservedIp('169.254.169.254'), true);
  });

  await test('SSRF: Deve bloquear ::1 e :: (Loopback IPv6)', () => {
    assert.strictEqual(isPrivateOrReservedIp('::1'), true);
    assert.strictEqual(isPrivateOrReservedIp('::'), true);
  });

  await test('SSRF: Deve bloquear fc00::/7 (IPv6 ULA Local Privado)', () => {
    assert.strictEqual(isPrivateOrReservedIp('fc00::1'), true);
    assert.strictEqual(isPrivateOrReservedIp('fd12:3456:789a::1'), true);
  });

  await test('SSRF: Deve bloquear IPv4-mapped IPv6 (ex: ::ffff:127.0.0.1)', () => {
    assert.strictEqual(isPrivateOrReservedIp('::ffff:127.0.0.1'), true);
    assert.strictEqual(isPrivateOrReservedIp('::ffff:192.168.1.10'), true);
  });

  await test('SSRF: Deve permitir IPs públicos válidos da internet', () => {
    assert.strictEqual(isPrivateOrReservedIp('8.8.8.8'), false);
    assert.strictEqual(isPrivateOrReservedIp('1.1.1.1'), false);
  });

  // 2. URL Safety Validation
  await test('SSRF: Deve recusar localhost e *.internal', async () => {
    const resLocalhost = await validateUrlSafety('http://localhost:3000');
    assert.strictEqual(resLocalhost.safe, false);

    const resMeta = await validateUrlSafety('http://metadata.google.internal/computeMetadata/v1');
    assert.strictEqual(resMeta.safe, false);
  });

  await test('SSRF: Deve recusar esquemas perigosos (file:, javascript:, ftp:)', async () => {
    const resFile = await validateUrlSafety('file:///etc/passwd');
    assert.strictEqual(resFile.safe, false);

    const resJs = await validateUrlSafety('javascript:alert(1)');
    assert.strictEqual(resJs.safe, false);
  });

  // 3. Sacred Affiliate Link Preservation
  await test('Afiliado: affiliateUrl deve ser preservado EXATAMENTE com todos os parâmetros', async () => {
    const affiliateRaw =
      'https://shopee.com.br/product/123456/789012?af_siteid=sinara_achadinhos&af_sub_siteid=instagram_bio&c=promo2026';
    const analysis = await analyzeProductLink(affiliateRaw);

    assert.strictEqual(analysis.affiliateUrl, affiliateRaw);
    assert.strictEqual(analysis.platform, 'shopee');
  });

  // 4. Password Hashing & PBKDF2 Verification
  await test('Auth: hashPassword deve produzir hash salted e verifyPassword deve validar corretamente', () => {
    const originalPassword = 'SenhaSuperSecreta!@#2026';
    const hash = hashPassword(originalPassword);

    assert.notStrictEqual(hash, originalPassword);
    assert.strictEqual(hash.startsWith('pbkdf2:'), true);

    const isValid = verifyPassword(originalPassword, hash);
    assert.strictEqual(isValid, true);

    const isWrongValid = verifyPassword('SenhaIncorreta123', hash);
    assert.strictEqual(isWrongValid, false);
  });

  // 5. Rate Limiter Mechanics
  await test('Rate Limiting: Deve bloquear requisições acima do limite', () => {
    const limiter = createRateLimiter({
      windowMs: 60000,
      max: 3,
      message: 'Bloqueado por excesso de requisições',
    });

    const mockReq: any = { ip: '192.0.2.1', path: '/test-rate-limit' };
    let statusSet = 200;
    let jsonBody: any = null;
    let nextCount = 0;

    const mockRes: any = {
      setHeader: () => {},
      status: (code: number) => {
        statusSet = code;
        return {
          json: (body: any) => {
            jsonBody = body;
          },
        };
      },
    };
    const mockNext = () => nextCount++;

    // Calls 1, 2, 3 should succeed
    limiter(mockReq, mockRes, mockNext);
    limiter(mockReq, mockRes, mockNext);
    limiter(mockReq, mockRes, mockNext);
    assert.strictEqual(nextCount, 3);

    // Call 4 must be rate-limited (HTTP 429)
    limiter(mockReq, mockRes, mockNext);
    assert.strictEqual(statusSet, 429);
    assert.strictEqual(jsonBody?.error, 'Muitas requisições');
  });

  // 6. Non-fatal behavior on offline/bogus link
  await test('Analisador: Não deve lançar exceção não tratada em URL inexistente e não deve inventar preço', async () => {
    const result = await analyzeProductLink('https://dominio-inexistente-totalmente-fake-123.com/produto');
    // Should return result gracefully without crashing
    assert.strictEqual(typeof result.message, 'string');
    assert.strictEqual(result.suggestedPrice, undefined, 'Preço NÃO pode ser inventado!');
  });

  console.log(`\n======================================================`);
  console.log(`🏁 RESULTADO DOS TESTES: ${passed} passaram | ${failed} falharam`);
  console.log(`======================================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
