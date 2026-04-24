import { NextResponse } from 'next/server';
import { listStorefrontProducts } from '@/lib/db-products';

/**
 * Returns a small featured slice of customer-visible storefront products.
 * The data is read dynamically from the database on each request.
 */
export async function GET() {
  const products = await listStorefrontProducts();
  const featured = products.slice(0, 6).map((product) => ({
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

  return NextResponse.json({ status: 'ok', count: featured.length, items: featured });
}
