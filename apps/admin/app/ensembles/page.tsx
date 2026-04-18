import { EnsembleBuilderPanel } from '@/components/ensemble-builder-panel';
import { requireAdmin } from '@/lib/auth/session';
import { listEnsembleDefinitions, listEnsembleProducts } from '@/lib/services/ensemble-service';

export default async function EnsemblesPage() {
  await requireAdmin();
  const ensembles = await listEnsembleDefinitions();
  const products = await listEnsembleProducts();

  return <EnsembleBuilderPanel ensembles={ensembles} products={products} />;
}
