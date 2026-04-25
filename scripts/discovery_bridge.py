#!/usr/bin/env python3
import argparse
import json
import re
import sqlite3
import sys
import time
from pathlib import Path
from typing import List, Dict, Optional

DB_PATH = '/home/hank/.openclaw/workspace/atelier-orchestrator/prisma/dev.db'

ITEM_SPLIT_RE = re.compile(r'^##\s+(\d+)\)\s+', re.MULTILINE)
URL_RE = re.compile(r'^- Source URL:\s+(.*)$', re.MULTILINE)
NOTE_RE = re.compile(r'^- Brief modesty/readiness note:\s+(.*)$', re.MULTILINE)
CONF_RE = re.compile(r'^- Confidence:\s+(.*)$', re.MULTILINE)
ASIN_RE = re.compile(r'/dp/([A-Z0-9]{10})')


def parse_items(markdown: str) -> List[Dict[str, str]]:
    matches = list(ITEM_SPLIT_RE.finditer(markdown))
    items = []
    for idx, match in enumerate(matches):
        start = match.end()
        end = matches[idx + 1].start() if idx + 1 < len(matches) else len(markdown)
        block = markdown[start:end].strip()
        lines = block.splitlines()
        title = lines[0].strip() if lines else ''
        url_match = URL_RE.search(block)
        note_match = NOTE_RE.search(block)
        conf_match = CONF_RE.search(block)
        if not title or not url_match:
            continue
        url = url_match.group(1).strip()
        asin_match = ASIN_RE.search(url)
        items.append({
            'title': title,
            'url': url,
            'source_identifier': asin_match.group(1) if asin_match else url,
            'note': note_match.group(1).strip() if note_match else '',
            'confidence': (conf_match.group(1).strip().lower() if conf_match else 'medium'),
        })
    return items


def slugify(value: str) -> str:
    slug = re.sub(r'[^a-z0-9]+', '-', value.lower()).strip('-')
    return slug[:48] or f'product-{int(time.time())}'


def confidence_to_db(value: str) -> str:
    return value if value in {'low', 'medium', 'high'} else 'medium'


def insert_items(conn: sqlite3.Connection, items: List[Dict[str, str]], limit: int, source_file: str):
    cur = conn.cursor()
    processed = inserted = skipped = failed = 0
    failures = []
    now_ms = int(time.time() * 1000)
    created_ids = []

    for item in items[:limit]:
        processed += 1
        try:
            duplicate = cur.execute(
                """
                select Product.id
                from Product
                join ProductSourceData on ProductSourceData.productId = Product.id
                where ProductSourceData.sourceIdentifier = ?
                   or ProductSourceData.canonicalUrl = ?
                   or ProductSourceData.affiliateUrl = ?
                limit 1
                """,
                (item['source_identifier'], item['url'], item['url']),
            ).fetchone()
            if duplicate:
                skipped += 1
                continue

            pid = f"bridge-{now_ms}-{processed}"
            slug = f"{slugify(item['title'])}-{processed}"
            now = time.strftime('%Y-%m-%d %H:%M:%S')
            raw_snapshot = json.dumps({
                'title': item['title'],
                'sourceNotes': item['note'],
                'sourceFile': source_file,
                'bridge': 'discovery_bridge.py',
            })

            cur.execute('insert into Product (id, slug, createdAt, updatedAt) values (?,?,?,?)', (pid, slug, now, now))
            cur.execute(
                'insert into ProductSourceData (id, productId, sourcePlatform, ingestMethod, sourceIdentifier, canonicalUrl, affiliateUrl, retrievedAt, title, rawSnapshotJson) values (?,?,?,?,?,?,?,?,?,?)',
                (f'{pid}-source', pid, 'amazon_manual', 'discovery_bridge', item['source_identifier'], item['url'], item['url'], now, item['title'], raw_snapshot),
            )
            cur.execute(
                'insert into ProductNormalizedData (id, productId, title, summary) values (?,?,?,?)',
                (f'{pid}-normalized', pid, item['title'], item['note']),
            )
            cur.execute(
                'insert into ProductInferredData (id, productId, dataConfidence, confidenceReason, confidenceImprovement, missingAttributesJson, uncertainAttributesJson) values (?,?,?,?,?,?,?)',
                (
                    f'{pid}-inferred',
                    pid,
                    confidence_to_db(item['confidence']),
                    'Imported from Ada discovery bridge.',
                    'Needs enrichment and validation before approval/publish.',
                    json.dumps(['brand', 'category', 'price', 'availability', 'images']),
                    json.dumps(['color', 'material', 'fit']),
                ),
            )
            cur.execute(
                'insert into ProductReviewState (id, productId, workflowState, reviewedAt, reviewedBy, reviewerNotes) values (?,?,?,?,?,?)',
                (f'{pid}-review', pid, 'discovered', now, 'discovery-bridge', item['note'] or 'Imported from Ada discovery batch.'),
            )
            cur.execute(
                'insert into ProductLifecycleState (id, productId, ingestState, reviewState, previewState, publishState, stateNotes, lastChangedAt, lastChangedBy) values (?,?,?,?,?,?,?,?,?)',
                (f'{pid}-lifecycle', pid, 'manual_seeded', 'pending', 'none', 'unpublished', 'Queued by discovery bridge.', now, 'discovery-bridge'),
            )
            cur.execute(
                'insert into ProductSourceHealth (id, productId, sourceStatus, lastSourceCheckAt, sourceCheckResult, needsRevalidation) values (?,?,?,?,?,?)',
                (f'{pid}-source-health', pid, 'unknown', now, 'Imported from Ada discovery file.', 0),
            )
            cur.execute(
                'insert into ProductVisibility (id, productId, isPublic, intendedActive, visibilityNotes, lastDisplayabilityCheckAt) values (?,?,?,?,?,?)',
                (f'{pid}-visibility', pid, 0, 0, 'Awaiting validation and review.', now),
            )
            inserted += 1
            created_ids.append(pid)
        except Exception as e:
            failed += 1
            failures.append({'title': item.get('title'), 'url': item.get('url'), 'reason': str(e)})

    conn.commit()
    return {
        'processed': processed,
        'inserted': inserted,
        'skipped': skipped,
        'failed': failed,
        'failures': failures,
        'created_ids': created_ids,
    }


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('source_file')
    parser.add_argument('--limit', type=int, default=10)
    args = parser.parse_args()

    source_path = Path(args.source_file)
    if not source_path.exists():
        print(json.dumps({'error': 'source_file_missing', 'path': str(source_path)}))
        sys.exit(1)

    items = parse_items(source_path.read_text())
    conn = sqlite3.connect(DB_PATH)
    result = insert_items(conn, items, args.limit, str(source_path))
    print(json.dumps(result, indent=2))


if __name__ == '__main__':
    main()
