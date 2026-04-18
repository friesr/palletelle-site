import { ProductEditorList } from '@/components/product-editor-list';
import { requireAdmin } from '@/lib/auth/session';
import { listEditableProducts } from '@/lib/services/product-service';

export default async function ProductEditorPage() {
  await requireAdmin();
  const products = await listEditableProducts();

  return <ProductEditorList products={products} />;
}
