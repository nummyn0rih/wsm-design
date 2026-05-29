import type { Shipment, Status } from '@/types/domain';
import type { ShipmentRepo } from '@/repos/types';
import { formatLocalDate, isSunday, parseLocalDate } from '@/lib/date';
import { mondayAtOffset } from '@/lib/week-utils';

interface ShipmentBlueprint {
  idSuffix: string;
  driverId: string;
  tkId: string;
  dayMonStart: 0 | 1 | 2 | 3 | 4 | 5; // 0=Mon..5=Sat
  status: Status;
  items: { rawId: string; kg: number; supplierId: string }[];
}

// Per-week (10 shipments) blueprints, identical structure across weeks except
// current-week cell-state coverage. drv_006 never appears (S2). drv_001 appears
// multiple times (S3). All 3 statuses present (S9). ≥1 sent in current week
// (S12). No Sunday arrDates (S11) — dayMonStart restricted to 0..5.

const CURRENT_WEEK_BLUEPRINTS: ShipmentBlueprint[] = [
  // Mon — designed for S1 cell-state coverage:
  // raw_cucumber  plan=10 fact=5    → short
  // raw_tomato    plan=10 fact=8.5  → close
  // raw_cherry    plan=10 fact=10.5 → norm
  // raw_patisson  plan=10 fact=13   → over
  // raw_pepper_hot plan=0 fact=3    → emptyOver
  // raw_jalapeno  plan=0 fact=0     → empty (no shipment for this day)
  {
    idSuffix: 'w0_01',
    driverId: 'drv_001',
    tkId: 'tk_ryabov',
    dayMonStart: 0,
    status: 'arrived',
    items: [{ rawId: 'raw_cucumber', kg: 5000, supplierId: 'sup_bayramov' }],
  },
  {
    idSuffix: 'w0_02',
    driverId: 'drv_002',
    tkId: 'tk_ryabov',
    dayMonStart: 0,
    status: 'arrived',
    items: [{ rawId: 'raw_tomato', kg: 8500, supplierId: 'sup_zorin' }],
  },
  {
    idSuffix: 'w0_03',
    driverId: 'drv_003',
    tkId: 'tk_autologist',
    dayMonStart: 0,
    status: 'sent',
    items: [{ rawId: 'raw_cherry', kg: 10500, supplierId: 'sup_kozlov' }],
  },
  {
    idSuffix: 'w0_04',
    driverId: 'drv_004',
    tkId: 'tk_autologist',
    dayMonStart: 0,
    status: 'sent',
    items: [{ rawId: 'raw_patisson', kg: 13000, supplierId: 'sup_lebedev' }],
  },
  {
    idSuffix: 'w0_05',
    driverId: 'drv_005',
    tkId: 'tk_transsib',
    dayMonStart: 0,
    status: 'sent',
    items: [{ rawId: 'raw_pepper_hot', kg: 3000, supplierId: 'sup_morozov' }],
  },
  // Tue–Fri — scheduled, additional raws (S7 heatmap raws subset)
  {
    idSuffix: 'w0_06',
    driverId: 'drv_001',
    tkId: 'tk_ryabov',
    dayMonStart: 1,
    status: 'scheduled',
    items: [
      { rawId: 'raw_cucumber', kg: 4000, supplierId: 'sup_bayramov' },
      { rawId: 'raw_onion', kg: 2000, supplierId: 'sup_nikitin' },
    ],
  },
  {
    idSuffix: 'w0_07',
    driverId: 'drv_002',
    tkId: 'tk_ryabov',
    dayMonStart: 2,
    status: 'scheduled',
    items: [{ rawId: 'raw_tomato', kg: 6000, supplierId: 'sup_nikitin' }],
  },
  {
    idSuffix: 'w0_08',
    driverId: 'drv_003',
    tkId: 'tk_autologist',
    dayMonStart: 2,
    status: 'scheduled',
    items: [{ rawId: 'raw_cabbage', kg: 3000, supplierId: 'sup_orlov' }],
  },
  {
    idSuffix: 'w0_09',
    driverId: 'drv_004',
    tkId: 'tk_autologist',
    dayMonStart: 3,
    status: 'scheduled',
    items: [{ rawId: 'raw_carrot', kg: 2500, supplierId: 'sup_kozlov' }],
  },
  {
    idSuffix: 'w0_10',
    driverId: 'drv_005',
    tkId: 'tk_transsib',
    dayMonStart: 4,
    status: 'scheduled',
    items: [{ rawId: 'raw_beetroot', kg: 1500, supplierId: 'sup_lebedev' }],
  },
];

const PREV_WEEK_BLUEPRINTS: ShipmentBlueprint[] = [
  {
    idSuffix: 'wprev_01',
    driverId: 'drv_001',
    tkId: 'tk_ryabov',
    dayMonStart: 0,
    status: 'arrived',
    items: [{ rawId: 'raw_cucumber', kg: 7000, supplierId: 'sup_bayramov' }],
  },
  {
    idSuffix: 'wprev_02',
    driverId: 'drv_002',
    tkId: 'tk_ryabov',
    dayMonStart: 0,
    status: 'arrived',
    items: [{ rawId: 'raw_tomato', kg: 9000, supplierId: 'sup_zorin' }],
  },
  {
    idSuffix: 'wprev_03',
    driverId: 'drv_003',
    tkId: 'tk_autologist',
    dayMonStart: 1,
    status: 'arrived',
    items: [{ rawId: 'raw_cherry', kg: 6000, supplierId: 'sup_kozlov' }],
  },
  {
    idSuffix: 'wprev_04',
    driverId: 'drv_004',
    tkId: 'tk_autologist',
    dayMonStart: 1,
    status: 'arrived',
    items: [{ rawId: 'raw_patisson', kg: 8500, supplierId: 'sup_lebedev' }],
  },
  {
    idSuffix: 'wprev_05',
    driverId: 'drv_005',
    tkId: 'tk_transsib',
    dayMonStart: 2,
    status: 'arrived',
    items: [{ rawId: 'raw_jalapeno', kg: 2000, supplierId: 'sup_morozov' }],
  },
  {
    idSuffix: 'wprev_06',
    driverId: 'drv_001',
    tkId: 'tk_ryabov',
    dayMonStart: 2,
    status: 'sent',
    items: [{ rawId: 'raw_onion', kg: 3500, supplierId: 'sup_nikitin' }],
  },
  {
    idSuffix: 'wprev_07',
    driverId: 'drv_002',
    tkId: 'tk_ryabov',
    dayMonStart: 3,
    status: 'sent',
    items: [{ rawId: 'raw_carrot', kg: 4000, supplierId: 'sup_orlov' }],
  },
  {
    idSuffix: 'wprev_08',
    driverId: 'drv_003',
    tkId: 'tk_autologist',
    dayMonStart: 3,
    status: 'scheduled',
    items: [{ rawId: 'raw_beetroot', kg: 1800, supplierId: 'sup_lebedev' }],
  },
  {
    idSuffix: 'wprev_09',
    driverId: 'drv_004',
    tkId: 'tk_autologist',
    dayMonStart: 4,
    status: 'scheduled',
    items: [{ rawId: 'raw_potato', kg: 5000, supplierId: 'sup_kozlov' }],
  },
  {
    idSuffix: 'wprev_10',
    driverId: 'drv_005',
    tkId: 'tk_transsib',
    dayMonStart: 5,
    status: 'scheduled',
    items: [{ rawId: 'raw_cabbage', kg: 2500, supplierId: 'sup_orlov' }],
  },
];

const NEXT_WEEK_BLUEPRINTS: ShipmentBlueprint[] = [
  {
    idSuffix: 'wnext_01',
    driverId: 'drv_001',
    tkId: 'tk_ryabov',
    dayMonStart: 0,
    status: 'scheduled',
    items: [{ rawId: 'raw_cucumber', kg: 6000, supplierId: 'sup_bayramov' }],
  },
  {
    idSuffix: 'wnext_02',
    driverId: 'drv_002',
    tkId: 'tk_ryabov',
    dayMonStart: 0,
    status: 'scheduled',
    items: [{ rawId: 'raw_tomato', kg: 7500, supplierId: 'sup_zorin' }],
  },
  {
    idSuffix: 'wnext_03',
    driverId: 'drv_003',
    tkId: 'tk_autologist',
    dayMonStart: 1,
    status: 'scheduled',
    items: [{ rawId: 'raw_cherry', kg: 4500, supplierId: 'sup_kozlov' }],
  },
  {
    idSuffix: 'wnext_04',
    driverId: 'drv_004',
    tkId: 'tk_autologist',
    dayMonStart: 1,
    status: 'scheduled',
    items: [{ rawId: 'raw_patisson', kg: 5500, supplierId: 'sup_lebedev' }],
  },
  {
    idSuffix: 'wnext_05',
    driverId: 'drv_005',
    tkId: 'tk_transsib',
    dayMonStart: 2,
    status: 'scheduled',
    items: [{ rawId: 'raw_pepper_sweet', kg: 3000, supplierId: 'sup_morozov' }],
  },
  {
    idSuffix: 'wnext_06',
    driverId: 'drv_001',
    tkId: 'tk_ryabov',
    dayMonStart: 2,
    status: 'sent',
    items: [{ rawId: 'raw_onion', kg: 2500, supplierId: 'sup_nikitin' }],
  },
  {
    idSuffix: 'wnext_07',
    driverId: 'drv_002',
    tkId: 'tk_ryabov',
    dayMonStart: 3,
    status: 'sent',
    items: [{ rawId: 'raw_carrot', kg: 3500, supplierId: 'sup_orlov' }],
  },
  {
    idSuffix: 'wnext_08',
    driverId: 'drv_003',
    tkId: 'tk_autologist',
    dayMonStart: 3,
    status: 'scheduled',
    items: [{ rawId: 'raw_beetroot', kg: 2000, supplierId: 'sup_lebedev' }],
  },
  {
    idSuffix: 'wnext_09',
    driverId: 'drv_004',
    tkId: 'tk_autologist',
    dayMonStart: 4,
    status: 'arrived',
    items: [{ rawId: 'raw_potato', kg: 4500, supplierId: 'sup_kozlov' }],
  },
  {
    idSuffix: 'wnext_10',
    driverId: 'drv_005',
    tkId: 'tk_transsib',
    dayMonStart: 5,
    status: 'arrived',
    items: [{ rawId: 'raw_cabbage', kg: 3500, supplierId: 'sup_orlov' }],
  },
];

function dateForDay(monday: Date, dayMonStart: 0 | 1 | 2 | 3 | 4 | 5): string {
  const d = new Date(monday);
  d.setDate(monday.getDate() + dayMonStart);
  return formatLocalDate(d);
}

function buildShipments(
  blueprints: ShipmentBlueprint[],
  offset: -1 | 0 | 1,
  nowIso: string,
): Shipment[] {
  const monday = mondayAtOffset(offset);
  return blueprints.map((bp) => {
    const arrDate = dateForDay(monday, bp.dayMonStart);
    if (isSunday(parseLocalDate(arrDate))) {
      throw new Error(
        `Seed integrity: Sunday arrDate detected for ${bp.idSuffix} (${arrDate})`,
      );
    }
    const shipDateDate = parseLocalDate(arrDate);
    shipDateDate.setDate(shipDateDate.getDate() - 1);
    const shipDate = formatLocalDate(shipDateDate);
    return {
      id: `ship_${bp.idSuffix}`,
      shipDate,
      arrDate,
      driverId: bp.driverId,
      tkId: bp.tkId,
      status: bp.status,
      comment: '',
      items: bp.items.map((it, j) => ({
        id: `item_${bp.idSuffix}_${j + 1}`,
        rawId: it.rawId,
        kg: it.kg,
        supplierId: it.supplierId,
        tara: [],
      })),
      createdAt: nowIso,
      updatedAt: nowIso,
    };
  });
}

export async function seedShipments(repo: ShipmentRepo): Promise<void> {
  const nowIso = new Date().toISOString();
  const all: Shipment[] = [
    ...buildShipments(PREV_WEEK_BLUEPRINTS, -1, nowIso),
    ...buildShipments(CURRENT_WEEK_BLUEPRINTS, 0, nowIso),
    ...buildShipments(NEXT_WEEK_BLUEPRINTS, 1, nowIso),
  ];
  for (const s of all) {
    await repo.save(s);
  }
}
