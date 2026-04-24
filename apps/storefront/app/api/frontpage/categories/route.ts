import { NextResponse } from 'next/server';
import { listStorefrontProducts } from '@/lib/db-products';

/**
 * Returns category counts derived dynamically from visible storefront products.
 */
export async function GET() {
  const products = await listStorefrontProducts();
  const counts = new Map<string, number>();

  for (const product of products) {
    const category = product.facts.find((fact) => fact.label === 'Category')?.value ?? 'Unspecified';
    counts.set(category, (counts.get(category) ?? 0) + 1);
  }

  const items = [...counts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((left, right) => right.count - left.count || left.name.localeCompare(right.name));

  return NextResponse.json({ status: 'ok', count: items.length, items });
}
