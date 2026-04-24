import { NextResponse } from 'next/server';
import { listStorefrontProducts } from '@/lib/db-products';

/**
 * Returns the latest customer-visible storefront products from the live DB path.
 */
export async function GET() {
  const products = await listStorefrontProducts();
  const latest = [...products].reverse().slice(0, 12).map((product) => ({
    id: product.id,
    slug: product.slug,
    name: product.name,
    brand: product.brand,
    priceLabel: product.priceLabel,
    colorLabel: product.colorLabel,
    image: product.image,
    buyUrl: product.buyUrl,
    canonicalUrl: product.canonicalUrl,
    category: product.facts.find((fact) => fact.label === 'Category')?.value ?? null,
  }));

  return NextResponse.json({ status: 'ok', count: latest.length, items: latest });
}
