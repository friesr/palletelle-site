import { AdminMissingRecord } from '@/components/admin-missing-record';
import { ProductEditorDetail } from '@/components/product-editor-detail';
import { requireAdmin } from '@/lib/auth/session';
import { getEditableProductById } from '@/lib/services/product-service';

export default async function ProductEditorDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();

  const { id } = await params;
  const product = await getEditableProductById(id);

  if (!product) {
    return <AdminMissingRecord title="Product editor record" backHref="/products" backLabel="Back to product editor list" />;
  }

  return <ProductEditorDetail product={product} />;
}
