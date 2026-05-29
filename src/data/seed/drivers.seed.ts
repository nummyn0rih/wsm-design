import type { Driver } from '@/types/domain';
import type { DriverRepo } from '@/repos/types';

// drv_006 intentionally has 0 shipments (S2 — successful delete by Admin).
// drv_001 referenced by ≥1 shipment (S3 — cascade restrict).
const DRIVERS: Driver[] = [
  {
    id: 'drv_001',
    fio: 'Иванов Иван Иванович',
    phone: '+79161234501',
    tkId: 'tk_ryabov',
    info: 'Старший водитель',
  },
  {
    id: 'drv_002',
    fio: 'Петров Пётр Петрович',
    phone: '+79161234502',
    tkId: 'tk_ryabov',
    info: '',
  },
  {
    id: 'drv_003',
    fio: 'Сидоров Сергей Сергеевич',
    phone: '+79161234503',
    tkId: 'tk_autologist',
    info: '',
  },
  {
    id: 'drv_004',
    fio: 'Кузнецов Алексей Викторович',
    phone: '+79161234504',
    tkId: 'tk_autologist',
    info: '',
  },
  {
    id: 'drv_005',
    fio: 'Смирнов Николай Андреевич',
    phone: '+79161234505',
    tkId: 'tk_transsib',
    info: '',
  },
  {
    id: 'drv_006',
    fio: 'Соколов Дмитрий Олегович',
    phone: '+79161234506',
    tkId: 'tk_transsib',
    info: 'Без отгрузок (для теста удаления)',
  },
];

export async function seedDrivers(repo: DriverRepo): Promise<void> {
  for (const d of DRIVERS) {
    await repo.save(d);
  }
}
