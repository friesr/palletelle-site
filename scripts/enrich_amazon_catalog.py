#!/usr/bin/env python3
import argparse
import json
import re
import sqlite3
import time
import urllib.request
from html import unescape
from typing import Optional

DB_PATH = 'prisma/dev.db'
USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36'

TITLE_PATTERNS = [
    re.compile(r'<meta\s+property="og:title"\s+content="([^"]+)"', re.I),
    re.compile(r'<meta\s+name="title"\s+content="([^"]+)"', re.I),
    re.compile(r'<title>([^<]+)</title>', re.I),
]
IMAGE_PATTERNS = [
    re.compile(r'<meta\s+property="og:image"\s+content="([^"]+)"', re.I),
    re.compile(r'"hiRes":"([^"]+)"', re.I),
    re.compile(r'"large":"([^"]+)"', re.I),
    re.compile(r'"mainUrl":"([^"]+)"', re.I),
]
BRAND_PATTERNS = [
    re.compile(r'<meta\s+name="brand"\s+content="([^"]+)"', re.I),
    re.compile(r'"brand"\s*:\s*"([^"]+)"', re.I),
    re.compile(r'id="bylineInfo"[^>]*>\s*(?:<a[^>]*>)?([^<]+)', re.I),
]
PRICE_PATTERNS = [
    re.compile(r'<meta\s+property="product:price:amount"\s+content="([^"]+)"', re.I),
    re.compile(r'<meta\s+name="twitter:data1"\s+content="([^"]+)"', re.I),
    re.compile(r'"priceToPay"[^\}]*"displayString":"([^"]+)"', re.I),
    re.compile(r'"price"\s*:\s*"(\$[^\"]+)"', re.I),
    re.compile(r'class="a-offscreen">(\$[^<]+)</span>', re.I),
]
WHOLE_PRICE_PATTERNS = [
    re.compile(r'a-price-whole">([0-9,]+)', re.I),
    re.compile(r'priceblock_ourprice[^>]*>\s*\$?([0-9,]+(?:\.[0-9]{2})?)', re.I),
]
FRACTION_PRICE_PATTERNS = [re.compile(r'a-price-fraction">([0-9]{2})', re.I)]


def first_match(text: str, patterns) -> Optional[str]:
    for pattern in patterns:
        match = pattern.search(text)
        if match and match.group(1):
            value = unescape(match.group(1)).strip()
            if value:
                return value
    return None


def extract_price_text(html: str) -> Optional[str]:
    direct = first_match(html, PRICE_PATTERNS)
    if direct:
        return direct if direct.startswith('$') else f'${direct}'
    whole = first_match(html, WHOLE_PRICE_PATTERNS)
    frac = first_match(html, FRACTION_PRICE_PATTERNS)
    if whole:
        whole = whole.replace(',', '')
        return f'${whole}.{frac}' if frac else f'${whole}'
    return None


def parse_amount_cents(price_text: Optional[str]) -> Optional[int]:
    if not price_text:
        return None
    match = re.search(r'\$\s*(\d+(?:\.\d{1,2})?)', price_text.replace(',', ''))
    if not match:
        return None
    return round(float(match.group(1)) * 100)


def fetch_html(url: str) -> str:
    req = urllib.request.Request(url, headers={
        'User-Agent': USER_AGENT,
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
    })
    with urllib.request.urlopen(req, timeout=45) as response:
        return response.read().decode('utf-8', errors='ignore')


def now_ts():
    return time.strftime('%Y-%m-%d %H:%M:%S')


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--limit', type=int, default=25)
    parser.add_argument('--only-missing-price', action='store_true')
    args = parser.parse_args()

    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cur = conn.cursor()

    where = "where psd.sourcePlatform='amazon_manual'"
    if args.only_missing_price:
        where += " and (nd.priceText is null or trim(nd.priceText)='')"

    rows = cur.execute(f'''
        select p.id, p.slug, psd.id as sourceId, psd.sourceIdentifier, psd.canonicalUrl, psd.affiliateUrl,
               psd.rawSnapshotJson, psd.title as sourceTitle, nd.title as normalizedTitle, nd.brand, nd.priceText
        from Product p
        join ProductSourceData psd on psd.productId=p.id
        join ProductNormalizedData nd on nd.productId=p.id
        {where}
        order by p.createdAt asc
        limit ?
    ''', (args.limit,)).fetchall()

    results = []
    for row in rows:
        url = row['canonicalUrl'] or row['affiliateUrl']
        if not url:
            results.append({'productId': row['id'], 'ok': False, 'reason': 'missing_url'})
            continue
        try:
            html = fetch_html(url)
            title = first_match(html, TITLE_PATTERNS) or row['sourceTitle'] or row['normalizedTitle'] or row['slug']
            image_url = first_match(html, IMAGE_PATTERNS)
            brand = first_match(html, BRAND_PATTERNS)
            price_text = extract_price_text(html)
            source_check = 'ok:python_fetch' if (image_url or price_text or brand) else 'fetched_no_structured_fields:python_fetch'
            raw = json.loads(row['rawSnapshotJson']) if row['rawSnapshotJson'] else {}
            merged = {
                **raw,
                'title': title,
                'canonicalUrl': row['canonicalUrl'],
                'affiliateUrl': row['affiliateUrl'],
                'image': image_url,
                'imageUrl': image_url,
                'mainImage': image_url,
                'mainImageUrl': image_url,
                'images': [image_url] if image_url else raw.get('images', []),
                'additionalImages': [image_url] if image_url else raw.get('additionalImages', []),
                'gallery': [image_url] if image_url else raw.get('gallery', []),
                'brand': brand,
                'priceText': price_text,
            }
            cur.execute('update ProductSourceData set title=?, priceText=?, rawSnapshotJson=?, retrievedAt=? where id=?', (
                title, price_text, json.dumps(merged), now_ts(), row['sourceId']
            ))
            cur.execute('update ProductNormalizedData set title=?, brand=coalesce(?, brand), priceText=coalesce(?, priceText) where productId=?', (
                title, brand, price_text, row['id']
            ))
            cur.execute('update ProductSourceHealth set sourceStatus=?, lastSourceCheckAt=?, sourceCheckResult=?, needsRevalidation=0, revalidationReason=null where productId=?', (
                'active', now_ts(), source_check, row['id']
            ))
            if price_text:
                cur.execute('insert into ProductPriceSnapshot (id, productId, productSourceDataId, capturedAt, priceText, priceAmountCents, currencyCode, captureMethod, notes) values (?,?,?,?,?,?,?,?,?)', (
                    f"{row['id']}-price-{int(time.time()*1000)}", row['id'], row['sourceId'], now_ts(), price_text, parse_amount_cents(price_text), 'USD' if '$' in price_text else None, 'python_catalog_enrichment', 'Batch Amazon enrichment capture.'
                ))
            conn.commit()
            results.append({'productId': row['id'], 'ok': True, 'title': title, 'brand': brand, 'priceText': price_text, 'imageFound': bool(image_url)})
        except Exception as exc:
            results.append({'productId': row['id'], 'ok': False, 'reason': str(exc)})
            conn.commit()

    print(json.dumps({
        'processed': len(rows),
        'succeeded': sum(1 for r in results if r['ok']),
        'failed': sum(1 for r in results if not r['ok']),
        'results': results,
    }, indent=2))


if __name__ == '__main__':
    main()
