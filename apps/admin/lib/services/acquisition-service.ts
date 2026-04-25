import { chromium } from 'playwright';

export type AcquisitionMethod = 'fetch' | 'http_hardened' | 'browser';

export interface AcquisitionResult {
  success: boolean;
  acquisitionMethod: AcquisitionMethod;
  html: string;
  finalUrl: string;
  statusCode: number | null;
  contentType: string | null;
  failureReason?: string;
}

function buildHeaders(hardened = false) {
  return {
    'user-agent': hardened
      ? 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36'
      : 'Mozilla/5.0',
    'accept-language': 'en-US,en;q=0.9',
    'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
    ...(hardened ? {
      'upgrade-insecure-requests': '1',
      'cache-control': 'no-cache',
      pragma: 'no-cache',
    } : {}),
  };
}

function hasUsableAmazonDom(html: string) {
  return /id="productTitle"/i.test(html) || /"hiRes":"https?:/i.test(html) || /class="a-price/i.test(html);
}

async function tierFetch(url: string): Promise<AcquisitionResult> {
  try {
    const response = await fetch(url, {
      headers: buildHeaders(false),
      redirect: 'follow',
      cache: 'no-store',
    });
    const html = await response.text();
    const success = response.ok && hasUsableAmazonDom(html);
    return {
      success,
      acquisitionMethod: 'fetch',
      html,
      finalUrl: response.url,
      statusCode: response.status,
      contentType: response.headers.get('content-type'),
      failureReason: success ? undefined : `fetch_${response.status}_${hasUsableAmazonDom(html) ? 'incomplete_dom' : 'bad_dom'}`,
    };
  } catch (error) {
    return {
      success: false,
      acquisitionMethod: 'fetch',
      html: '',
      finalUrl: url,
      statusCode: null,
      contentType: null,
      failureReason: `fetch_exception:${error instanceof Error ? error.message : 'unknown'}`,
    };
  }
}

async function tierHardened(url: string): Promise<AcquisitionResult> {
  try {
    const response = await fetch(url, {
      headers: buildHeaders(true),
      redirect: 'follow',
      cache: 'no-store',
    });
    const html = await response.text();
    const success = response.ok && hasUsableAmazonDom(html);
    return {
      success,
      acquisitionMethod: 'http_hardened',
      html,
      finalUrl: response.url,
      statusCode: response.status,
      contentType: response.headers.get('content-type'),
      failureReason: success ? undefined : `http_hardened_${response.status}_${hasUsableAmazonDom(html) ? 'incomplete_dom' : 'bad_dom'}`,
    };
  } catch (error) {
    return {
      success: false,
      acquisitionMethod: 'http_hardened',
      html: '',
      finalUrl: url,
      statusCode: null,
      contentType: null,
      failureReason: `http_hardened_exception:${error instanceof Error ? error.message : 'unknown'}`,
    };
  }
}

async function tierBrowser(url: string): Promise<AcquisitionResult> {
  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
      userAgent: buildHeaders(true)['user-agent'],
      locale: 'en-US',
    });
    const page = await context.newPage();
    const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(2000);
    const html = await page.content();
    const finalUrl = page.url();
    const statusCode = response?.status() ?? null;
    const contentType = response?.headers()['content-type'] ?? null;
    const success = (statusCode === null || (statusCode >= 200 && statusCode < 400)) && hasUsableAmazonDom(html);
    await context.close();
    await browser.close();
    return {
      success,
      acquisitionMethod: 'browser',
      html,
      finalUrl,
      statusCode,
      contentType,
      failureReason: success ? undefined : `browser_${statusCode ?? 'no_status'}_${hasUsableAmazonDom(html) ? 'incomplete_dom' : 'bad_dom'}`,
    };
  } catch (error) {
    if (browser) {
      await browser.close().catch(() => {});
    }
    return {
      success: false,
      acquisitionMethod: 'browser',
      html: '',
      finalUrl: url,
      statusCode: null,
      contentType: null,
      failureReason: `browser_exception:${error instanceof Error ? error.message : 'unknown'}`,
    };
  }
}

export async function acquireProductPage(url: string): Promise<AcquisitionResult> {
  const tier1 = await tierFetch(url);
  if (tier1.success) return tier1;

  const tier2 = await tierHardened(url);
  if (tier2.success) return tier2;

  const tier3 = await tierBrowser(url);
  if (tier3.success) return tier3;

  return tier3.failureReason ? tier3 : tier2.failureReason ? tier2 : tier1;
}
