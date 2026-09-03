import dns from 'dns';
import { PlatformId, LinkAnalysisResult } from '../src/types';
import { detectPlatformFromUrl, PLATFORMS_CONFIG } from '../src/utils/platformHelper';
import { dbService } from './db';

const MAX_REDIRECTS = 5;
const REQUEST_TIMEOUT_MS = 4000;
const MAX_RESPONSE_BYTES = 512 * 1024; // 512 KB

// ==========================================
// SSRF VALIDATION & IP CHECK
// ==========================================

export function isPrivateOrReservedIp(ip: string): boolean {
  if (!ip) return true;

  // Handle IPv4-mapped IPv6 (e.g. ::ffff:127.0.0.1 or ::ffff:192.168.1.1)
  let cleanIp = ip.toLowerCase();
  if (cleanIp.startsWith('::ffff:')) {
    cleanIp = cleanIp.substring(7);
  }

  // IPv4 Checks
  if (cleanIp.includes('.')) {
    const parts = cleanIp.split('.').map((p) => parseInt(p, 10));
    if (parts.length !== 4 || parts.some(isNaN) || parts.some((p) => p < 0 || p > 255)) {
      return true; // Malformed IPv4 is blocked
    }

    const [b0, b1] = parts;

    // 0.0.0.0/8 (Current network)
    if (b0 === 0) return true;
    // 10.0.0.0/8 (Private network)
    if (b0 === 10) return true;
    // 100.64.0.0/10 (Carrier-grade NAT)
    if (b0 === 100 && b1 >= 64 && b1 <= 127) return true;
    // 127.0.0.0/8 (Loopback)
    if (b0 === 127) return true;
    // 169.254.0.0/16 (Link-local & Cloud Metadata e.g. 169.254.169.254)
    if (b0 === 169 && b1 === 254) return true;
    // 172.16.0.0/12 (Private network)
    if (b0 === 172 && b1 >= 16 && b1 <= 31) return true;
    // 192.0.0.0/24 (IETF Protocol Assignments)
    if (b0 === 192 && b1 === 0 && parts[2] === 0) return true;
    // 192.0.2.0/24 (TEST-NET-1)
    if (b0 === 192 && b1 === 0 && parts[2] === 2) return true;
    // 192.168.0.0/16 (Private network)
    if (b0 === 192 && b1 === 168) return true;
    // 198.18.0.0/15 (Network benchmark tests)
    if (b0 === 198 && (b1 === 18 || b1 === 19)) return true;
    // 198.51.100.0/24 (TEST-NET-2)
    if (b0 === 198 && b1 === 51 && parts[2] === 100) return true;
    // 203.0.113.0/24 (TEST-NET-3)
    if (b0 === 203 && b1 === 0 && parts[2] === 113) return true;
    // 224.0.0.0/4 (Multicast) & 240.0.0.0/4 (Reserved) & 255.255.255.255 (Broadcast)
    if (b0 >= 224) return true;

    return false;
  }

  // IPv6 Checks
  if (cleanIp.includes(':')) {
    // Loopback
    if (cleanIp === '::1' || cleanIp === '0:0:0:0:0:0:0:1') return true;
    // Unspecified
    if (cleanIp === '::' || cleanIp === '0:0:0:0:0:0:0:0') return true;
    // Unique Local Addresses (fc00::/7, covers fc00:: and fd00::)
    if (cleanIp.startsWith('fc') || cleanIp.startsWith('fd')) return true;
    // Link-local unicast (fe80::/10, fe8*, fe9*, fea*, feb*)
    if (/^fe[89ab]/i.test(cleanIp)) return true;
    // Multicast (ff00::/8)
    if (cleanIp.startsWith('ff')) return true;
    // Documentation prefix (2001:db8::/32)
    if (cleanIp.startsWith('2001:db8') || cleanIp.startsWith('2001:0db8')) return true;

    return false;
  }

  return true;
}

export async function validateUrlSafety(urlString: string): Promise<{
  safe: boolean;
  reason?: string;
  urlObj?: URL;
  resolvedIp?: string;
}> {
  if (!urlString || typeof urlString !== 'string') {
    return { safe: false, reason: 'URL vazia ou inválida.' };
  }

  let parsed: URL;
  try {
    parsed = new URL(urlString.trim());
  } catch {
    return { safe: false, reason: 'Formato de URL inválido.' };
  }

  // Protocol check: only http and https
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return { safe: false, reason: `Protocolo ${parsed.protocol} não permitido. Use apenas http ou https.` };
  }

  const hostname = parsed.hostname.toLowerCase();

  // Block forbidden hostnames and patterns
  if (
    hostname === 'localhost' ||
    hostname.endsWith('.localhost') ||
    hostname.endsWith('.local') ||
    hostname.endsWith('.internal') ||
    hostname.endsWith('.lan') ||
    hostname.endsWith('.corp') ||
    hostname === 'metadata.google.internal' ||
    hostname === 'instance-data'
  ) {
    return { safe: false, reason: `Host ${hostname} é restrito/interno e não pode ser acessado.` };
  }

  // Direct IP address check in hostname
  if (/^(\d{1,3}\.){3}\d{1,3}$/.test(hostname) || hostname.includes(':')) {
    if (isPrivateOrReservedIp(hostname)) {
      return { safe: false, reason: `O IP ${hostname} pertence a uma faixa privada ou reservada (SSRF bloqueado).` };
    }
  }

  // DNS Resolution check (prevents DNS rebinding and private IP domain mapping)
  try {
    const addresses = await dns.promises.lookup(hostname, { all: true });
    if (!addresses || addresses.length === 0) {
      return { safe: false, reason: `Não foi possível resolver o domínio ${hostname}.` };
    }

    for (const record of addresses) {
      if (isPrivateOrReservedIp(record.address)) {
        return {
          safe: false,
          reason: `O domínio ${hostname} resolveu para o IP restrito/privado ${record.address} (SSRF bloqueado).`,
        };
      }
    }

    return { safe: true, urlObj: parsed, resolvedIp: addresses[0].address };
  } catch (err: any) {
    return { safe: false, reason: `Falha na consulta DNS de ${hostname}: ${err.message}` };
  }
}

// ==========================================
// PLATFORM DETECTION
// ==========================================
export function detectPlatform(url: string): { id: PlatformId; name: string } {
  if (!url) return { id: 'other', name: 'Outra Loja Parceira' };

  try {
    const detectedId = detectPlatformFromUrl(url);
    if (detectedId && detectedId !== 'other' && PLATFORMS_CONFIG[detectedId]) {
      return { id: detectedId, name: PLATFORMS_CONFIG[detectedId].name };
    }
  } catch {
    // ignore
  }

  return { id: 'other', name: 'Outra Loja Parceira' };
}

// ==========================================
// SAFE REDIRECT RESOLUTION
// ==========================================
export interface ResolveResult {
  finalUrl: string;
  status: number;
  body: string;
  redirectCount: number;
  error?: string;
}

export async function fetchWithSafeRedirects(initialUrl: string): Promise<ResolveResult> {
  let currentUrl = initialUrl;
  let redirectCount = 0;

  while (redirectCount <= MAX_REDIRECTS) {
    const safety = await validateUrlSafety(currentUrl);
    if (!safety.safe) {
      throw new Error(`SSRF Block: Redirecionamento para destino inseguro recusado (${safety.reason})`);
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const response = await fetch(currentUrl, {
        method: 'GET',
        redirect: 'manual', // Enforce manual step-by-step redirect validation
        signal: controller.signal,
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
          'Sec-Fetch-Dest': 'document',
          'Sec-Fetch-Mode': 'navigate',
        },
      });

      clearTimeout(timer);

      // Handle HTTP redirects (301, 302, 303, 307, 308)
      if ([301, 302, 303, 307, 308].includes(response.status)) {
        const location = response.headers.get('location');
        if (!location) {
          // No location header, stop here
          return { finalUrl: currentUrl, status: response.status, body: '', redirectCount };
        }

        // Resolve relative redirects against current URL
        const nextUrl = new URL(location, currentUrl).toString();
        currentUrl = nextUrl;
        redirectCount++;
        continue;
      }

      // Read response body safely with size limit
      let body = '';
      if (response.body) {
        const reader = response.body.getReader();
        let bytesRead = 0;
        const chunks: Uint8Array[] = [];

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          if (value) {
            bytesRead += value.length;
            chunks.push(value);
            if (bytesRead >= MAX_RESPONSE_BYTES) {
              reader.cancel();
              break;
            }
          }
        }

        const fullBuffer = Buffer.concat(chunks);
        body = fullBuffer.toString('utf-8');
      } else {
        body = await response.text();
      }

      return {
        finalUrl: currentUrl,
        status: response.status,
        body,
        redirectCount,
      };
    } catch (err: any) {
      clearTimeout(timer);
      if (err.name === 'AbortError') {
        throw new Error(`Tempo limite de requisição excedido (${REQUEST_TIMEOUT_MS}ms).`);
      }
      throw err;
    }
  }

  throw new Error(`Limite de redirecionamentos excedido (máximo ${MAX_REDIRECTS} saltos).`);
}

// ==========================================
// MAIN LINK ANALYZER
// ==========================================
export async function analyzeProductLink(inputUrl: string): Promise<LinkAnalysisResult> {
  const trimmedUrl = (inputUrl || '').trim();

  // Basic format validation
  if (!trimmedUrl) {
    return {
      platform: 'other',
      platformName: 'Outra Loja',
      affiliateUrl: '',
      success: false,
      message: 'Por favor, informe a URL do produto.',
    };
  }

  if (
    trimmedUrl.startsWith('javascript:') ||
    trimmedUrl.startsWith('data:') ||
    trimmedUrl.startsWith('file:') ||
    trimmedUrl.startsWith('ftp:')
  ) {
    return {
      platform: 'other',
      platformName: 'Inválido',
      affiliateUrl: trimmedUrl,
      success: false,
      message: 'Protocolo de URL inválido ou potencialmente perigoso.',
    };
  }

  // Pre-validate input URL for SSRF
  const initialSafety = await validateUrlSafety(trimmedUrl);
  if (!initialSafety.safe) {
    return {
      platform: 'other',
      platformName: 'Inválido',
      affiliateUrl: trimmedUrl,
      originalUrl: trimmedUrl,
      resolvedUrl: trimmedUrl,
      success: false,
      message: initialSafety.reason || 'A URL informada não é um endereço público seguro.',
      error: initialSafety.reason || 'A URL informada não é um endereço público seguro.',
    };
  }

  // CRITICAL REQUIREMENT:
  // originalUrl: the exact link pasted by admin
  // affiliateUrl: MUST REMAIN the exact original affiliate link for public CTA button!
  // resolvedUrl: final target after safe redirects, used for detection and metadata extraction
  const originalUrl = trimmedUrl;
  const affiliateUrl = trimmedUrl; // NEVER overwrite affiliateUrl!

  // Initial detection
  let detected = detectPlatform(trimmedUrl);
  let resolvedUrl = trimmedUrl;

  let suggestedTitle: string | undefined;
  let suggestedImage: string | undefined;
  let suggestedDescription: string | undefined;
  let suggestedPrice: number | undefined;
  let suggestedOriginalPrice: number | undefined;
  let message = `Plataforma ${detected.name} identificada.`;

  try {
    // Safely follow redirects up to max 5 hops with SSRF validation at every step
    const result = await fetchWithSafeRedirects(trimmedUrl);
    resolvedUrl = result.finalUrl;

    // If platform was not identified on short link, check resolved URL
    if (detected.id === 'other') {
      const resolvedDetection = detectPlatform(resolvedUrl);
      if (resolvedDetection.id !== 'other') {
        detected = resolvedDetection;
      }
    }

    if (result.body && result.status >= 200 && result.status < 400) {
      const html = result.body;

      // Extract Open Graph / Twitter title
      const ogTitleMatch =
        html.match(/<meta\s+property=["']og:title["']\s+content=["'](.*?)["']/i) ||
        html.match(/<meta\s+name=["']twitter:title["']\s+content=["'](.*?)["']/i);

      if (ogTitleMatch && ogTitleMatch[1]) {
        suggestedTitle = decodeHtmlEntities(ogTitleMatch[1].trim());
      } else {
        const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
        if (titleMatch && titleMatch[1]) {
          suggestedTitle = decodeHtmlEntities(titleMatch[1].trim());
        }
      }

      // Extract Open Graph image
      const ogImageMatch =
        html.match(/<meta\s+property=["']og:image["']\s+content=["'](.*?)["']/i) ||
        html.match(/<meta\s+name=["']twitter:image["']\s+content=["'](.*?)["']/i);

      if (ogImageMatch && ogImageMatch[1]) {
        suggestedImage = ogImageMatch[1].trim();
      }

      // Extract description
      const ogDescMatch =
        html.match(/<meta\s+property=["']og:description["']\s+content=["'](.*?)["']/i) ||
        html.match(/<meta\s+name=["']description["']\s+content=["'](.*?)["']/i);

      if (ogDescMatch && ogDescMatch[1]) {
        suggestedDescription = decodeHtmlEntities(ogDescMatch[1].trim());
      }

      // Extract Price strictly from metadata schema (never invent a price!)
      const priceMetaMatch =
        html.match(/itemprop=["']price["']\s+content=["']([\d.,]+)["']/i) ||
        html.match(/property=["']product:price:amount["']\s+content=["']([\d.,]+)["']/i) ||
        html.match(/"price":\s*"?([\d.]+)"?/i);

      if (priceMetaMatch && priceMetaMatch[1]) {
        const rawPrice = priceMetaMatch[1].replace(',', '.');
        const parsed = parseFloat(rawPrice);
        if (!isNaN(parsed) && parsed > 0) {
          suggestedPrice = parsed;
        }
      }

      if (suggestedTitle || suggestedImage) {
        message = `Plataforma ${detected.name} identificada e dados públicos extraídos com sucesso!`;
      } else {
        message = `Plataforma ${detected.name} identificada. Preencha os campos abaixo para completar o cadastro.`;
      }
    } else {
      // Non-200 response (e.g. anti-bot 403, Cloudflare challenge, or JS-only hydration)
      message = `Plataforma ${detected.name} identificada. Preencha os campos abaixo para completar o cadastro.`;
    }
  } catch (err: any) {
    // Non-fatal fallback: Never block registration if third-party website has bot protection
    message = `Plataforma ${detected.name} identificada. Não foi possível carregar os dados automaticamente da loja externa. Preencha os campos abaixo para salvar.`;
  }

  return {
    platform: detected.id,
    platformName: detected.name,
    affiliateUrl, // THE SACRED AFFILIATE LINK IS UNTOUCHED
    originalUrl,
    resolvedUrl,
    suggestedTitle,
    suggestedImage,
    suggestedDescription,
    suggestedPrice, // Undefined if not found; never fabricated
    suggestedOriginalPrice,
    success: true, // Non-fatal! Allows manual registration
    message,
  };
}

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
