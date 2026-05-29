import type { TaraType } from '@/types/domain';
import type { LocalStorageTaraTypeRepo } from '@/repos/TaraTypeRepo';

const TARA_TYPES: TaraType[] = [
  {
    id: 'tara_plastic_barrel',
    name: 'Бочка пластиковая 250 л',
    shortName: 'Бочка пластик.',
    volumeL: 250,
    color: '#cfd8dc',
  },
  {
    id: 'tara_iron_barrel',
    name: 'Бочка железная 200 л',
    shortName: 'Бочка железн.',
    volumeL: 200,
    color: '#9e9e9e',
  },
  {
    id: 'tara_wooden_box',
    name: 'Ящик деревянный',
    shortName: 'Ящик дер.',
    volumeL: null,
    color: '#a1887f',
  },
];

export async function seedTaraTypes(
  repo: LocalStorageTaraTypeRepo,
): Promise<void> {
  await repo._seedWrite(TARA_TYPES);
}
