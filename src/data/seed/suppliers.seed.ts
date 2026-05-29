import type { Supplier } from '@/types/domain';
import type { SupplierRepo } from '@/repos/types';

const SUPPLIERS: Supplier[] = [
  { id: 'sup_bayramov', name: 'Байрамов А.' },
  { id: 'sup_zorin', name: 'Зорин В.' },
  { id: 'sup_kozlov', name: 'Козлов М.' },
  { id: 'sup_lebedev', name: 'Лебедев С.' },
  { id: 'sup_morozov', name: 'Морозов И.' },
  { id: 'sup_nikitin', name: 'Никитин П.' },
  { id: 'sup_orlov', name: 'Орлов Д.' },
];

export async function seedSuppliers(repo: SupplierRepo): Promise<void> {
  for (const s of SUPPLIERS) {
    await repo.save(s);
  }
}
