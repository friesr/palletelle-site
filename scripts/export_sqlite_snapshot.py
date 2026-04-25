#!/usr/bin/env python3
import json
import sqlite3
from pathlib import Path

ROOT = Path('/home/hank/.openclaw/workspace/atelier-orchestrator')
DB_PATH = ROOT / 'prisma' / 'dev.db'
OUT_PATH = ROOT / 'data' / 'migration' / 'sqlite-snapshot.json'

TABLE_ORDER = [
    'Product',
    'ProductSourceData',
    'ProductPriceSnapshot',
    'ProductNormalizedData',
    'ProductInferredData',
    'ProductLifecycleState',
    'ProductLifecycleAudit',
    'ProductReviewState',
    'ProductVisibility',
    'ProductSourceHealth',
    'ExternalProductSignals',
    'CustomerReview',
    'ReviewSummary',
    'Ensemble',
    'EnsembleItem',
    'AffiliateConfig',
    'User',
    'UserProfile',
    'ColorProfile',
    'PreferenceProfile',
    'SavedProduct',
    'SavedEnsemble',
    'AuthMethod',
    'MFAEnrollment',
]


def main() -> None:
    OUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    export = {
        'source': str(DB_PATH),
        'tableOrder': TABLE_ORDER,
        'tables': {},
    }
    for table in TABLE_ORDER:
        rows = conn.execute(f'SELECT * FROM "{table}"').fetchall()
        export['tables'][table] = [dict(row) for row in rows]
    OUT_PATH.write_text(json.dumps(export, indent=2, default=str))
    summary = {table: len(export['tables'][table]) for table in TABLE_ORDER}
    print(json.dumps({'written': str(OUT_PATH), 'counts': summary}, indent=2))


if __name__ == '__main__':
    main()
