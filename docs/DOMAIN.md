# WSM — Domain & Business Rules

> Источник правды для сущностей, enum, инвариантов и бизнес-правил Phase 1. Все правила здесь — основа для service-layer (`src/services/`); UI-компоненты вызывают сервисы, не дублируют правила.

## Contents

1. [Glossary](#1-glossary)
2. [Принципы доменной модели](#2-принципы-доменной-модели)
3. [TypeScript types](#3-typescript-types)
4. [Invariants](#4-invariants)
5. [Status lifecycle и transitions](#5-status-lifecycle-и-transitions)
6. [Permission matrix](#permission-matrix)
7. [Edit mode actions matrix](#edit-mode-actions-matrix)
8. [Archive rules](#archive-rules)
9. [Plan cell state rule](#cell-state-rule)
10. [Visibility protection](#visibility-protection)
11. [Fact aggregation](#fact-aggregation)
12. [Default status](#default-status)
13. [Date calc & ТК autofill](#date-calc--тк-autofill)
14. [Dates & working week](#dates-working-week)
15. [Units (kg / tons)](#units)
16. [Validation](#validation)
17. [Phone storage](#phone-storage)
18. [Cascade restrict (FK delete)](#cascade-restrict)
19. [Tara rules](#tara-rules)
20. [Global order (sortOrder)](#global-order)
21. [Plans hierarchy: weekly vs contract](#plans-hierarchy)
22. [Fixed rules (Appendix)](#fixed-rules)

---

## 1. Glossary

| Термин (RU) | ID/enum | Определение |
|---|---|---|
| Отгрузка | `Shipment` | Одна машина (грузовик), приходящая на завод. Имеет одного водителя, одну ТК, общую дату отгрузки и дату поступления, статус, опциональный комментарий. Содержит N позиций (`ShipmentItem`). |
| Позиция отгрузки | `ShipmentItem` | Строка внутри одной отгрузки: одно сырьё × один поставщик × вес в кг (+ опц. тара). Минимум 1 позиция. |
| Фермер / Поставщик | `Supplier` | Сельхозпроизводитель сырья. Привязан к контрактам (Phase 2). |
| Транспортная компания (ТК) | `TransportCompany` | Перевозчик. Привязан к водителю (1 водитель — 1 ТК в Phase 1). |
| Водитель | `Driver` | Физлицо. ФИО, телефон (E.164), ссылка на ТК, info. |
| Сырьё / Овощ | `RawMaterial` | Тип овоща. 13 культур в Phase 1. Имеет цвет (`bg` + `dot`), `sortOrder`, `allowedTara`. Без деления «основные/сезонные» — оператор сам выбирает актуальные через ⚙. |
| План недели | `WeekPlan` | Тонны сырья по дням недели (ПН–СБ): `Record<RawId, [d0..d5]>`. Содержит `visibleRaws` (per-week). |
| Факт | — | Сумма веса (кг) по всем `ShipmentItem` за день/неделю по `rawId`. **Все 3 статуса** (scheduled + sent + arrived). |
| Режим: Таблица | `view='table'` | Аккордеон отгрузок, сгруппированных по неделе и дню. |
| Режим: Heatmap | `view='heatmap'` | Сводная сетка сырьё × дни недели. Цвет = сырьё, насыщенность = объём. |
| Режим: План | `view='plan'` | Недельная сетка `visibleRaws` × 6 дней с inline plan editing + fact + progress. |
| Архивная неделя | `WeekPlan.archive=true` | Прошлые недели. Plan view read-only. **Архивность не влияет** на Shipment editing в TableView. |
| Статус отгрузки | `Status` | `'scheduled' | 'sent' | 'arrived'`. |
| Роль | `Role` | `'admin' | 'operator' | 'user' | 'director'`. Phase 1 active: admin, operator, user. |
| Акт приёмки | `QualityRecord` | Phase 2. |
| Тип тары | `TaraType` | Справочник видов тары. Seed Phase 1 (FK consistency); UI/CRUD Phase 2. |
| Тара (позиция) | `TaraEntry` | `{taraTypeId, count}` внутри `ShipmentItem`. Phase 1 всегда `[]`. |
| Норматив загрузки | `TaraLoadNorm` | `(supplierId × rawId × taraTypeId) → fullTruckKg + fullTruckCount`. Phase 2. |
| Тарная отправка | `TaraShipment` | Phase 2. |
| Ингредиент | `Ingredient` | Phase 2. |
| Контракт | `Contract` | Соглашение завод↔фермер на сезон. Phase 2. См. [Plans hierarchy](#plans-hierarchy). |
| Сезон | `Season` | Phase 2. |

---

## 2. Принципы доменной модели

- **Все ID — строки** в формате `nanoid()` или префиксированные (`drv_xxx`, `tk_xxx`, `sup_xxx`, `raw_xxx`, `tara_xxx`).
- **Все enum-значения — английские строки** (`'scheduled' | 'sent' | 'arrived'`).
- **Все русские отображаемые тексты — только в `*_LABELS` константах**.
- **Связи между сущностями — через ID** (`driverId`, `tkId`, `supplierId`, `rawId`), не через display name. JOIN на presentation-слое через хук `useDriver(id)` → repo lookup.
- **Все persistable сущности — `{ id: string, ...fields }`**.
- **Телефоны хранятся в E.164** (см. [Phone storage](#phone-storage)).
- **Даты хранятся как ISO date string** `YYYY-MM-DD`, обрабатываются как plain local dates.
- **`ShipmentItem.kg` — килограммы** (integer > 0).
- **`WeekPlan.plan[r][d]` — тонны** (`number`, step 0.1).

---

## 3. TypeScript types

```ts
// src/types/domain.ts

// ============= Enums =============

export type Role = 'admin' | 'operator' | 'user' | 'director';
// Phase 1 active: admin, operator, user.
// director — зарезервирована, в RoleToggle Phase 1 отсутствует.

export type Status = 'scheduled' | 'sent' | 'arrived';

export type CellState =
  | 'empty'
  | 'emptyOver'
  | 'short'
  | 'close'
  | 'norm'
  | 'over';

// ============= Labels (Russian display only) =============

export const STATUS_LABELS: Record<Status, string> = {
  scheduled: 'Запланировано',
  sent: 'Отправлено',
  arrived: 'Прибыло',
};

export const ROLE_LABELS: Record<Role, string> = {
  admin: 'Админ',
  operator: 'Оператор',
  user: 'Пользователь',
  director: 'Директор',
};

// RoleToggle Phase 1 показывает только active роли:
export const PHASE1_ACTIVE_ROLES: Role[] = ['admin', 'operator', 'user'];

// ============= Entities =============

export interface Driver {
  id: string;                // 'drv_xxx'
  fio: string;               // required, min 2 chars
  phone: string;             // E.164: ^\+7\d{10}$
  tkId: string;              // FK → TransportCompany; required
  info: string;              // optional (default ''); max 500
}

export interface TransportCompany {
  id: string;                // 'tk_xxx'
  name: string;              // "ИП Рябов", "АвтоЛогист"
  // shortName: НЕ добавляется в Phase 1. Используется name везде.
}

export interface Supplier {
  id: string;                // 'sup_xxx'
  name: string;              // "Байрамов А.", "Цой К.Т."
  region?: string;           // Phase 2
}

export interface RawMaterial {
  id: string;                // 'raw_cucumbers', 'raw_cherry'
  name: string;              // "Огурцы", "Черри"
  unit: 'kg' | 'ton' | 'pcs' | 'box'; // default 'kg'
  // Цвета — ЕДИНЫЙ источник правды (не дублируется в raw-colors.ts).
  // raw-colors.ts — только helper, читает из RawRepo.
  bg: string;                // "#d4eac2"
  dot: string;               // "#4a8f2a" or linear-gradient(...)
  // Глобальный порядок (1..N), уникальный.
  // Используется во всех UI-списках (Plan grid, ⚙ popover, Heatmap).
  // Phase 1: задан в seed; UI редактирования — Phase 2.
  sortOrder: number;
  // FK → TaraType.id[]. [] = «без тары». Конфигурируется в seed.
  allowedTara: string[];
  // Phase 2: qualityParams: QualityParam[]
}

export interface ShipmentItem {
  id: string;
  rawId: string;             // FK → RawMaterial
  // Кг (kilograms). Integer > 0.
  kg: number;
  supplierId: string;        // FK → Supplier
  // Phase 1: ВСЕГДА []. Phase 2: автогенерация через TaraLoadNorm.
  tara: TaraEntry[];
  // Phase 2: qualityRecordId, actNumber, processed
}

export interface Shipment {
  id: string;
  shipDate: string;          // ISO date "YYYY-MM-DD", любой день недели
  arrDate: string;           // ISO date "YYYY-MM-DD", ПН–СБ (не ВС)
  driverId: string;          // FK → Driver
  tkId: string;              // FK → TransportCompany (live recompute, не snapshot)
  status: Status;
  comment: string;           // default ''; max 200
  items: ShipmentItem[];     // min 1
  createdAt: string;         // ISO datetime
  updatedAt: string;         // ISO datetime
}

export interface WeekPlan {
  id: string;                // "W17_2025"
  weekNum: number;           // 1..53
  year: number;
  archive: boolean;          // archive=true → Plan view read-only, PlanRepo.save throws
  // plan[rawId][day]: ТОННЫ (number, step 0.1).
  plan: Record<string, number[]>;
  // visible raw'ы для Plan grid. Per-week, не глобально.
  // Управляется Admin через ⚙ popover.
  visibleRaws: string[];
}

// User: Phase 1 — только мок role
export interface User {
  role: Role;
  // Phase 3: id, email, fio, permissions[], ...
}

// ============= Phase 2: Tara domain (зарезервировано) =============

export interface TaraType {
  id: string;                // 'tara_veg_box', 'tara_plastic_drum'
  name: string;              // "Бочка пластиковая 250 л"
  shortName: string;         // "Бочка пластик."
  volumeL: number | null;
  color: string;
}

export interface TaraEntry {
  taraTypeId: string;        // FK → TaraType
  count: number;             // integer > 0
}

export interface TaraLoadNorm {
  id: string;
  supplierId: string;
  rawId: string;
  taraTypeId: string;
  fullTruckKg: number;
  fullTruckCount: number;
}

export interface TaraShipment {
  id: string;
  shipDate: string;
  driverId: string;
  tkId: string;
  status: TaraStatus;
  items: TaraShipmentItem[];
  createdAt: string;
  updatedAt: string;
}

export interface TaraShipmentItem {
  id: string;
  supplierId: string;
  taraTypeId: string;
  count: number;
}

export type TaraStatus = 'in_transit' | 'delivered' | 'overdue';
```

---

## 4. Invariants

| # | Сущность | Инвариант |
|---|---|---|
| I1 | `Shipment` | `items.length >= 1` |
| I2 | `Shipment` | `arrDate >= shipDate` |
| I3 | `ShipmentItem` | `kg > 0` (integer) |
| I4 | `Shipment` | `driverId` ссылается на существующего `Driver` (валидируется при save) |
| I5 | `Shipment` | при смене `driverId` → `tkId` пересчитывается до `driver.tkId` (live, не snapshot) |
| I6 | `Driver` | нельзя удалить если есть `Shipment.driverId === this.id` (cascade restrict) |
| I7 | `Supplier` | нельзя удалить если есть `ShipmentItem.supplierId === this.id` (Phase 2; Phase 1 supplier read-only) |
| I8 | `RawMaterial` | нельзя удалить (Phase 2; Phase 1 read-only) |
| I9 | `WeekPlan` | `archive=true` → `PlanRepo.save()` бросает ошибку, Plan view input'ы read-only. **Не влияет** на `ShipmentRepo` ни в каком виде. |
| I10 | `WeekPlan` | Нельзя **снять** `rawId` из `visibleRaws`, если `plan[rawId]?.some(t => t > 0)` ИЛИ существует `ShipmentItem` с этим `rawId` и `arrDate` внутри недели. **Поставить** `rawId` можно всегда. |
| I11 | Все entity | `id` неизменяем после create. |
| I12 | `Status` transitions | **Strict Variant A**: разрешено только `scheduled → sent` и `sent → arrived`. **Запрещены**: `scheduled → arrived` (direct), `arrived → sent`, `sent → scheduled`, любые другие обратные. Только Admin может `scheduled → sent`; Admin и Operator могут `sent → arrived`. |
| I13 | `Driver.phone` | matches regex `^\+7\d{10}$` (E.164 RU) |
| I14 | `Driver.fio` | min 2 chars |
| I15 | `ShipmentItem` | `tara` всегда массив (включая пустой). Phase 1 = `[]`. |
| I16 | `RawMaterial` | `allowedTara` — массив существующих `TaraType.id`. `[]` = «без тары». |
| I17 | `TaraEntry` (Phase 2) | `count > 0` integer. `taraTypeId` ∈ `raw.allowedTara` соответствующего `ShipmentItem.rawId`. |
| I18 | `TaraLoadNorm` (Phase 2) | Unique by `(supplierId, rawId, taraTypeId)`. `fullTruckKg > 0`, `fullTruckCount > 0`. `taraTypeId` ∈ `raw.allowedTara`. |
| I19 | `RawMaterial` | `sortOrder` — целое положительное, уникальное в пределах всех `RawMaterial`. |
| I20 | `WeekPlan` | `visibleRaws` содержит только существующие `RawMaterial.id`. Без дубликатов. |
| **I21** | `Shipment` | `arrDate` не должен попадать на воскресенье. Working week = Mon–Sat. Inline validation в Form E блокирует save. |
| **I22** | `WeekPlan` | `plan[rawId][day]` — `number ≥ 0`, нормализованный до шага 0.1. Хранение — `number`, без локализованных строк. |
| **I23** | `Shipment.comment` | max 200 chars. Operator может править `comment` для любого статуса; остальные поля — only Admin. |

---

## 5. Status lifecycle и transitions

### 5.1 Состояния

1. `scheduled` — «Запланировано». Машина заказана, выезд ожидается. **Дефолт при create**.
2. `sent` — «Отправлено». Машина выехала, в пути.
3. `arrived` — «Прибыло». Машина на заводе, разгружена.

> «План» в Plan view — это **UI-состояние пустой ячейки** (план есть, факта нет). Не сохраняется в `Status` enum и не создаёт `Shipment`.

### 5.2 Allowed transitions (strict Variant A)

| From | To | Allowed | Roles |
|---|---|---|---|
| (create) | `scheduled` | ✓ | Admin |
| (create) | `sent` | ✓ | Admin |
| `scheduled` | `sent` | ✓ | **Admin only** |
| `sent` | `arrived` | ✓ | **Admin + Operator** |
| `scheduled` | `arrived` | ✗ запрещён напрямую | — |
| `arrived` | `sent` | ✗ обратный запрещён | — |
| `sent` | `scheduled` | ✗ обратный запрещён | — |
| `arrived` | `scheduled` | ✗ обратный запрещён | — |

Pure-helper:

```ts
// src/services/shipmentStatus.ts
canTransitionShipmentStatus(role: Role, from: Status, to: Status): boolean
// Возвращает true только если:
//   - (from='scheduled', to='sent') && role='admin'
//   - (from='sent', to='arrived') && (role='admin' || role='operator')
// Иначе false.

nextAllowedStatuses(role: Role, s: Shipment): Status[]
// 'scheduled' (admin) → ['sent']
// 'sent' (admin|operator) → ['arrived']
// иначе → []
```

Если ошиблись со статусом — **delete + recreate** (Phase 2: обратные переходы).

---

## Permission matrix

| Действие | Admin | Operator | User | Director (Phase 3+) |
|---|---|---|---|---|
| **Sidebar** |  |  |  |  |
| Отгрузки | ✓ | ✓ | ✓ | (Phase 3 dashboard) |
| Справочники → Водители | ✓ полный | ✓ просмотр | ✓ просмотр | скрыто |
| Future-разделы (Логистика, Контракты, Аналитика, …) | заглушки | скрыто | скрыто | скрыто |
| **Shipment** |  |  |  |  |
| Просмотр Table/Heatmap/Plan | ✓ | ✓ | ✓ | — |
| Открыть DriverModal | ✓ | ✓ | ✓ | — |
| Create Shipment | ✓ | ✗ | ✗ | — |
| Edit core fields (driver, tk, dates, items, kg, supplier, raw) | ✓ | ✗ | ✗ | — |
| Edit `comment` | ✓ | ✓ | ✗ | — |
| Delete Shipment | ✓ | ✗ | ✗ | — |
| Status `scheduled → sent` | ✓ | ✗ | ✗ | — |
| Status `sent → arrived` | ✓ | ✓ | ✗ | — |
| **WeekPlan** |  |  |  |  |
| Edit plan input (тонны) | ✓ | ✗ | ✗ | — |
| Manage `visibleRaws` (⚙) | ✓ | ✗ | ✗ | — |
| **Drivers** |  |  |  |  |
| Browse | ✓ | ✓ | ✓ | — |
| Create / Edit | ✓ | ✗ | ✗ | — |
| Delete | ✓ (с cascade check) | ✗ | ✗ | — |

### Permission helpers (signatures)

Реализация в `src/services/permissions.ts`:

```ts
canCreateShipment(role: Role): boolean
canEditShipmentCoreFields(role: Role, s: Shipment): boolean
canEditShipmentComment(role: Role, s: Shipment): boolean
canEditShipmentItems(role: Role, s: Shipment): boolean
canDeleteShipment(role: Role, s: Shipment): boolean
canTransitionShipmentStatus(role: Role, from: Status, to: Status): boolean
canEditWeekPlan(role: Role, wp: WeekPlan): boolean
canManagePlanVisibleRaws(role: Role, wp: WeekPlan): boolean
canCrudDrivers(role: Role): boolean
canDeleteDriver(role: Role, driverId: string, shipmentRepo: ShipmentRepo): Promise<boolean>
```

> RoleGate — UI guard, не enforcement. Реальные проверки прав — backend Phase 3.

---

## Edit mode actions matrix

Form E в edit-mode, действия по `(status, role)`:

| Status | Admin actions | Operator actions | User |
|---|---|---|---|
| `scheduled` | Сохранить (full edit), Отправить (→ sent), Удалить | Сохранить (только `comment`); status-actions отсутствуют; Удалить скрыто | edit недоступен |
| `sent` | Сохранить (full edit), Отметить прибывшим (→ arrived), Удалить | Сохранить (только `comment`); status-actions отсутствуют; mark-arrived — через TableView action, не через Form E; Удалить скрыто | edit недоступен |
| `arrived` | Сохранить (только `comment`; поля акта Phase 2), Удалить | Сохранить (только `comment`); status-actions отсутствуют; Удалить скрыто | edit недоступен |

Для Operator: все поля кроме `comment` — read-only; add/remove `ShipmentItem` — disabled. **Status-actions внутри restricted Form E отсутствуют для всех статусов**; разрешённый Operator transition `sent → arrived` выполняется через TableView action (`MarkArrivedButton`).

Для статуса `arrived` (Admin или Operator): остальные поля кроме `comment` — read-only; add/remove `ShipmentItem` disabled; status-actions отсутствуют.

---

## Archive rules

`WeekPlan.archive=true`:

- **Plan view**: все input'ы read-only; ⚙ скрыт; клик по plan-cell **не открывает** Form E; pill «🔒 Архив» в шапке.
- **`PlanRepo.save(wp)` бросает ошибку**, если `wp.archive === true`.

**Archive scope НЕ влияет на**:
- TableView отображение.
- Form E edit/delete для Shipment с `arrDate` в архивной неделе.
- Status transitions для Shipment в архивной неделе.
- Mark-arrived action в TableView.
- `ShipmentRepo` методы.

**Seed layer записывает archived `WeekPlan` напрямую** (минуя runtime save check) — это initial data setup, не runtime user/service edit. Инвариант I9 относится к runtime save, не к seed write path. Подробности — [`IMPLEMENTATION.md#seed-strategy`](IMPLEMENTATION.md#seed-strategy).

В Phase 1 архивная неделя — **предыдущая относительно `currentWeekId()`** на момент seed. Флаг `archive` присваивается в seed, не вычисляется от today во время runtime. Конкретные week-номера/year (например, «W16/2025») — иллюстративные примеры, не обязательные labels.

---

## Cell state rule

_Источник: `reference/project/plan-view.jsx` L166–192. **Не редизайнить**._

```ts
// src/lib/cell-state.ts
// Аргументы в ТОННАХ.
function getCellState(planTons: number, factTons: number): CellState {
  if (!planTons || planTons <= 0) {
    return factTons && factTons > 0 ? 'emptyOver' : 'empty';
  }
  const pct = (factTons / planTons) * 100;
  if (pct < 80) return 'short';
  if (pct < 100) return 'close';
  if (pct <= 120) return 'norm';
  return 'over';
}
```

Визуальные палитры и таблица состояний — [`DESIGN.md`](DESIGN.md#plan-cell-palette).

---

## Visibility protection

См. инвариант I10. Если пользователь пытается снять чекбокс с защищённого овоща — чекбокс не реагирует, tooltip «нельзя скрыть: есть план/отгрузки». Поставить — всегда можно. Empty state (`visibleRaws=[]`) — per-role text:

- **Admin**: «План не создан. Отметьте овощи для планирования через ⚙».
- **Operator / User**: «План не создан. Обратитесь к администратору для настройки овощей недели».

```ts
// src/services/planRules.ts
canDeleteVisibleRaw(wp: WeekPlan, rawId: string, shipments: Shipment[]): boolean
// false если plan[rawId]?.some(t => t > 0) || shipments.some(s => arrDate in week && s.items.some(i => i.rawId === rawId))
```

---

## Fact aggregation

Все 3 статуса (`scheduled`, `sent`, `arrived`) суммируются в факт ячейки Plan view и Heatmap.

_Источник: комментарий в `reference/project/pivot-summary.jsx` L4–6 и `plan-view.jsx` L4–7._

> Обоснование: heatmap и план показывают «что ожидается + что уже пришло» единым потоком, чтобы планёр видел, заполняется ли план или нет.

---

## Default status

- «Сохранить как запланировано» → `status='scheduled'`.
- «✓ Сохранить и отправить» → `status='sent'`.
- В Plan-mode prefill default-action — `scheduled`.

---

## Date calc & ТК autofill

### Расчёт `arrDate`

- При вводе `shipDate` без `arrDate`: автоустанавливается `arrDate = shipDate + 1 day`.
- Пользователь может изменить (но ≥ shipDate и не воскресенье).
- В Plan-mode `arrDate` — prefill из ячейки и **locked**.

### ТК autofill

- При выборе `Driver` → `tkId` автоматически выставляется в `driver.tkId`.
- ТК становится readonly. При смене водителя — пересчёт **live**, не snapshot.
- В Edit-mode: то же.

---

## Dates & working week

- **Хранение**: ISO date string `YYYY-MM-DD`. Обрабатываются как plain local dates. **Никаких UTC-конверсий**.
- **Helpers** в `src/lib/date.ts`:
  - `parseLocalDate(s: string): Date` — `'2025-04-21'` → `Date` local midnight.
  - `formatLocalDate(d: Date): string` — `Date` → `'2025-04-21'`.
  - `isoWeek(d: Date): { weekNum, year }`.
  - `dayOfWeekMonStart(d: Date): 0|1|2|3|4|5|6` — 0=ПН … 5=СБ, 6=ВС.
  - `isSunday(d: Date | string): boolean`.
  - `currentWeekId(): { weekNum, year }`.

### Working week = Mon–Sat

- `shipDate` может быть любым днём недели (машина выезжает в выходной — допустимо).
- **`arrDate` не должен быть воскресеньем** — блокируется валидацией (I21).
- Plan grid и Heatmap отображают только ПН–СБ. Воскресных данных не существует (запрет через validation).

Inline error в Form E: «Воскресенье — нерабочий день. Выберите дату поступления с ПН по СБ».

**Prefill из Plan cell не освобождает от Sunday-block validation**: даже если значение пришло из prefill (locked `arrDate`), валидация Sunday применяется при save. Plan grid Mon–Sat only, поэтому click на воскресенье технически невозможен — но safety check на validation layer обязателен. Seed/plan cells **не должны** содержать Sunday `arrDate`.

---

## Units

- **`ShipmentItem.kg`** — килограммы, `number`, **integer > 0**.
- **`WeekPlan.plan[rawId][day]`** — тонны, `number`, **шаг 0.1**, `>= 0`.
- **`factTons = sumKg / 1000`**.
- Heatmap отображает кг (sum).
- Form E вводит кг.
- Plan input редактирует тонны.

### Helpers (`src/lib/units.ts`)

```ts
kgToTons(kg: number): number              // kg / 1000
tonsToKg(t: number): number               // t * 1000
parseTonsInput(input: string): number | null
// Принимает русскую запятую или точку. '1,5' | '1.5' → 1.5. '' → null. NaN → null.
formatTons(n: number, locale?: string): string
// 1.5 → '1,5' (ru-RU); 1.10 → '1,1'.
roundToStep(n: number, step: number): number
// roundToStep(1.234, 0.1) → 1.2
formatKg(kg: number, locale?: string): string
// 18000 → '18 000' (Intl.NumberFormat ru-RU)
```

---

## Validation

Реализация в `src/lib/validation.ts` как pure functions.

### `validateShipment(s: Shipment): ValidationError[]`

Возвращает массив ошибок (пустой = валидно):

- `items.length >= 1` (I1)
- Каждый `ShipmentItem`: `rawId` непустой, `kg > 0` integer (I3), `supplierId` непустой
- `shipDate` непустой ISO date
- `arrDate` непустой ISO date
- `arrDate >= shipDate` (I2)
- **`!isSunday(arrDate)`** (I21)
- `driverId` непустой, ссылается на существующего Driver (I4)
- `comment.length <= 200`

### `validateDriver(d: Driver): ValidationError[]`

- `fio.length >= 2` (I14)
- `phone` matches `^\+7\d{10}$` (I13) — на сохранённом E.164
- `tkId` непустой
- `info.length <= 500`

### `validatePlanInput(t: string | number): { value: number } | { error: string }`

- `parseTonsInput` → number или error «Введите число».
- `>= 0` или error «План не может быть отрицательным».
- `roundToStep(0.1)` нормализация.

### Form E inline rules (UI-level, блокируют save)

- Save заблокирован, пока хотя бы один `ShipmentItem.kg <= 0`. Inline error «Введите вес > 0».
- Save заблокирован, если `shipDate > arrDate`. Inline error «Дата поступления должна быть ≥ даты отгрузки».
- Save заблокирован, если `isSunday(arrDate)`. Inline error «Воскресенье — нерабочий день. Выберите ПН–СБ».

---

## Phone storage

Все телефонные номера — **строго E.164 RU**: `^\+7\d{10}$`.

Три формы Phase 1:

| Форма | Применение | Пример |
|---|---|---|
| **Storage** (E.164) | LocalStorage `wsm:v1:drivers`, `Driver.phone` поле | `+79012345678` |
| **Display** (human-readable) | UI отображение в DriverModal, DriversRef таблице, всех Label | `+7 (901) 234-56-78` |
| **Copy** | Кнопка «📋 копировать» в DriverModal — копирует **human-readable formatted** строку (не E.164, не tel: URI) | `+7 (901) 234-56-78` |

`tel:` URI и другие интеграционные форматы (vCard, etc.) — **Phase 3 mobile**. Не реализуются Phase 1.

Helpers в `src/lib/phone.ts`:

```ts
normalizePhoneRu(input: string): string | null
// Принимает свободный ввод (с пробелами, скобками, дефисами, без +7, с 8 в начале и т.д.),
// возвращает E.164 или null.
formatPhoneRu(e164: string): string
// '+79012345678' → '+7 (901) 234-56-78'
phoneTelUri(e164: string): string
// '+79012345678' → 'tel:+79012345678'
```

`<PhoneField>` (`src/components/atoms/PhoneField.tsx`, ~30 строк, без внешних масок):
- Принимает свободный ввод.
- На `onBlur` — нормализация. Если `null` — inline error, блокирует save.
- В read-state отображает `formatPhoneRu`.

В `validateDriver` обязательно проверяется `^\+7\d{10}$` на сохранённом значении.
В DriverModal кнопка copy → `formatPhoneRu(phone)`.

---

## Cascade restrict

`DriverRepo.delete(id)`:

```ts
// src/services/driverDelete.ts
async function canDeleteDriver(role, driverId, shipmentRepo): Promise<boolean> {
  if (!canCrudDrivers(role)) return false;
  const count = await shipmentRepo.countByDriver(driverId);
  return count === 0;
}
```

- UI: если `count > 0` → 🗑 disabled (`opacity: 0.3`, `cursor: not-allowed`) + tooltip «Используется в N отгрузках».
- API/repo: `DriverRepo.delete` всегда проверяет cascade и бросает `CascadeRestrictError('Невозможно удалить: используется в N отгрузках')` (защита от обхода UI).

В Phase 1 это единственный случай каскада (Drivers — единственная редактируемая dictionary).

---

## Tara rules

### Phase 1 (Core)

- `ShipmentItem.tara = []` **всегда**.
- Display-only в строке позиции: «Тара: —».
- Никаких UI редактирования. Form E не имеет поля тары.
- `TaraType` seed существует (для FK consistency с `RawMaterial.allowedTara`).
- `TaraTypeRepo` — read-only `CrudRepo<TaraType, void>` (методы `save`/`delete` не вызываются).

### Phase 2 (Tara autogen)

При create/edit `ShipmentItem`:

1. Если `raw.allowedTara === []` → `tara = []` (без тары; огурцы, перец острый, перец сладкий).
2. Иначе ищется набор `TaraLoadNorm` по `(supplierId, rawId)`:
   - 0 норм → ValidationError «Не настроен норматив тары для фермера X и сырья Y».
   - 1 норма → `taraTypeId` автоматически.
   - ≥2 норм → Form E показывает select типа тары (из `allowedTara`); пользователь выбирает.
3. **Расчёт count**: `count = Math.round(kg / norm.fullTruckKg * norm.fullTruckCount)`.
4. **`count` редактируется вручную** (например, при неполной загрузке).
5. **Тип тары** не редактируется после автогенерации/выбора.

**Пример 1** (Цой, черри, ящики): `fullTruckKg=18000`, `fullTruckCount=1050`. Отгрузка 10000 кг → `count = round(10000/18000 * 1050) = 583`.
**Пример 2** (Мищенко, патиссоны, железные бочки): `fullTruckKg=12000`, `fullTruckCount=60`. Отгрузка 8000 кг → `count = 40`.

---

## Global order

`RawMaterial.sortOrder: number` — глобальный порядок овощей во всех UI-списках:

- Plan grid (строки таблицы)
- ⚙ popover видимости
- Heatmap (строки)
- Селект сырья в Form E

Сортировка — ASC. `sortOrder` уникален в пределах всех `RawMaterial` (I19).

Phase 1 — задан в `raws.seed.ts`, UI редактирования отсутствует.
Phase 2 — экран настроек / drag-and-drop в popover.

Изменение `sortOrder` влияет только на будущее отображение. Старые `WeekPlan.visibleRaws` остаются как массив rawId; сортируется при рендере.

---

## Plans hierarchy

### Weekly plan (`WeekPlan`)

- Оперативный недельный спрос: сколько тонн каждого сырья **должно поступить** на завод в конкретной неделе.
- **Не отвечает** «от кого». Поставщик выбирается оператором при создании `Shipment`.
- Per-week, persisted в `PlanRepo`.

### Contract plan (`Contract`) — Phase 2

- Соглашение завод↔фермер на сезон: сколько и каких овощей конкретный поставщик обязан поставить.
- N позиций (raw × даты × тонны × цена).
- Phase 2: используется для аналитики, контроля план/факт по сезону, финансового учёта.

### Связь между ними

- **`WeekPlan` не выводится автоматически из `Contract`**. Никогда.
- Weekly = операционная плоскость, contract = коммерческая плоскость.
- Phase 2: дашборд может показать «выполнение контракта по сезону» отдельно от «выполнение недельного плана».

---

## Fixed rules

| # | Правило | Источник |
|---|---|---|
| F1 | Цветовая логика ячейки плана 80/100/120 (6 состояний) | `reference/project/plan-view.jsx` L166–192 |
| F2 | Палитра 13 сырья — атрибут `RawMaterial.bg/dot` в seed | `reference/project/Wireframes.html` L182–197; этот документ §3 |
| F3 | Статус-чипы (3 цвета в Phase 1, иконки) | `reference/project/Wireframes.html` L200–211 |
| F4 | Heatmap считает все 3 статуса как факт | `reference/project/pivot-summary.jsx` L4–6, `plan-view.jsx` L4–7 |
| F5 | Одна машина = одна Shipment с N ShipmentItem | `reference/project/Wireframes.html` L1484 |
| F6 | Шкала ProgressBar 0–150% с маркером 100% | `reference/project/plan-view.jsx` L199–280 |
| F7 | Phone хранение E.164, отображение `+7 (xxx) xxx-xx-xx` | этот документ [Phone storage](#phone-storage) |
| F8 | **Status transitions: strict Variant A** — только `scheduled → sent` и `sent → arrived`. Прямой `scheduled → arrived` запрещён. Обратные запрещены. | этот документ I12, §5 |
| F9 | Тара `TaraEntry[]`, Phase 1 = `[]` display-only, Phase 2 = автогенерация с editable count и fixed type | этот документ [Tara rules](#tara-rules) |
| F10 | Список 13 RawMaterial. Перец = 3 raw'а. Без модели сезонности. | этот документ §1, §3 |
| F11 | `RawMaterial.allowedTara` — свойство сырья в seed, не отдельная связь | этот документ §3, I16 |
| F12 | `WeekPlan.visibleRaws: string[]` — per-week. Default `[]`. Plan grid рендерит только видимые + empty state. | этот документ I20, §3, [Visibility protection](#visibility-protection) |
| F13 | `RawMaterial.sortOrder: number` — глобальный порядок ASC. Phase 1 в seed, UI редактирования Phase 2. | этот документ I19, [Global order](#global-order) |
| F14 | Heatmap auto-filter: показывает только овощи с ≥1 отгрузкой за неделю. Независим от `visibleRaws`. | этот документ §1, [PRD §3.2](PRD.md#32-режим-heatmap) |
| **F15** | **Operator edit scope = только `Shipment.comment`**. Никаких других полей. Никаких create/delete. Только `sent → arrived` transition. | этот документ [Permission matrix](#permission-matrix), I23 |
| **F16** | **Archive scope = только `WeekPlan` и Plan view**. TableView/Shipment edit/delete/mark-arrived работают независимо от archive. | этот документ I9, [Archive rules](#archive-rules) |
| **F17** | **Working week = Mon–Sat**. `arrDate` воскресенье блокируется валидацией. `shipDate` может быть любым днём. | этот документ I21, [Dates & working week](#dates-working-week) |

— конец DOMAIN.md —
