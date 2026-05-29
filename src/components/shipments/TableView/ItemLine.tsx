import type { FC } from 'react';
import type { ShipmentItem } from '@/types/domain';
import { RawPill } from '@/components/atoms/RawPill';
import { Label } from '@/components/atoms/Label';
import { fmtKg } from '@/lib/format';

interface Props {
  item: ShipmentItem;
  supplierName: string;
}

export const ItemLine: FC<Props> = ({ item, supplierName }) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      padding: '2px 0',
    }}
  >
    <RawPill rawId={item.rawId} />
    <Label size={13} mono>
      {fmtKg(item.kg)} кг
    </Label>
    <Label size={13} color="var(--ink-muted)">
      {supplierName}
    </Label>
  </div>
);
