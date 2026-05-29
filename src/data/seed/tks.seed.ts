import type { TransportCompany } from '@/types/domain';
import type { TKRepo } from '@/repos/types';

const TKS: TransportCompany[] = [
  { id: 'tk_ryabov', name: 'ИП Рябов' },
  { id: 'tk_autologist', name: 'АвтоЛогист' },
  { id: 'tk_transsib', name: 'ТрансСиб' },
];

export async function seedTks(repo: TKRepo): Promise<void> {
  for (const t of TKS) {
    await repo.save(t);
  }
}
