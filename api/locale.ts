import type { Locale } from '../src/i18n/locales.ts';

function countryLocale(country: string | null): Locale | null {
  if (!country || !/^[A-Z]{2}$/.test(country) || ['XX', 'ZZ'].includes(country)) return null;
  if (country === 'CN') return 'zh-CN';
  if (['TW', 'HK', 'MO'].includes(country)) return 'zh-Hant';
  return 'en';
}

export function GET(request: Request): Response {
  return Response.json({ locale: countryLocale(request.headers.get('cf-ipcountry')) }, {
    headers: {
      'Cache-Control': 'private, no-store',
      'CDN-Cache-Control': 'no-store',
      'Cloudflare-CDN-Cache-Control': 'no-store',
    },
  });
}
