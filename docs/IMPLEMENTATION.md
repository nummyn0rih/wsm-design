# WSM — Implementation Architecture

> Технический источник правды Phase 1. Стек, repos, services, hooks, state management, folder structure, seed strategy, testing, future API notes.

## Contents

1. [Tech stack](#1-tech-stack)
2. [Storage layer](#2-storage-layer)
3. [Repository pattern](#3-repository-pattern)
4. [LocalStorageRepo](#4-localstoragerepo)
5. [Observer для реактивности](#5-observer-для-реактивности)
6. [DI через React Context](#6-di-через-react-context)
7. [Service / domain layer](#7-service--domain-layer)
8. [Permission helpers](#permission-helpers)
9. [RoleGate](#8-rolegate)
10. [ShipmentsPage state model](#9-shipmentspage-state-model)
11. [i18n / formatting](#10-i18n--formatting)
12. [Browsers](#11-browsers)
13. [Performance](#12-performance)
14. [Folder structure](#13-folder-structure)
15. [Seed strategy](#seed-strategy)
16. [Testing](#15-testing)
17. [Future API notes](#16-future-api-notes)

---

## 1. Tech stack

- **Framework**: React 18.x.
- **Build**: Vite (последняя стабильная).
- **Language**: TypeScript, `strict: true`.
- **Router**: react-router-dom v6 (BrowserRouter).
- **UI library**: нет (атомы — собственные).
- **State**: React Context + `useSyncExternalStore` (для repo observer). Никаких Redux/Zustand/Jotai в Phase 1.
- **Fonts**: Caveat (handwriting, основной), JetBrains Mono (моноширинный) — через Google Fonts с preconnect.
- **Иконки**: emoji (как в прототипе).
- **ID generator**: `nanoid`.
- **Phone mask**: своя реализация в `src/lib/phone.ts` + `<PhoneField>`. Никаких сторонних масок.
- **Линтинг**: ESLint + `@typescript-eslint/recommended` + Prettier.
- **Тесты**: **Vitest** для unit-тестов критических pure functions. Component-тесты — Phase 2+.

---

## 2. Storage layer

### Phase 1

- **LocalStorage через `LocalStorageRepo<T, Q>`** (см. ниже).
- Все ключи: `wsm:v1:<entity>` (например `wsm:v1:shipments`).
- Schema versioning: заглушка `migrate()` в `LocalStorageRepo` — точка расширения.

### Phase 2+

> **CrudRepo<T, Q> — внутренний контракт Phase 1, НЕ финальный backend API contract.**
>
> `listSync` неприменим к API: понадобятся `loading/error/refetch` states, client-side cache, optimistic updates. Бесшовная замена `LocalStorageRepo → ApiRepo` **не гарантируется** — потребуется query/service layer (например, react-query или своя обёртка).
>
> UI Phase 1 идёт через **services**, не напрямую в repo. При миграции на API мы меняем service-implementations и hooks; компоненты не трогаются (если service-контракт стабильный).

---

## 3. Repository pattern

```ts
// src/repos/types.ts
export interface CrudRepo<T extends { id: string }, Q = void> {
  list(query?: Q): Promise<T[]>;            // async для бизнес-логики и будущего API
  listSync(query?: Q): T[];                  // sync snapshot из in-memory cache, для useSyncExternalStore
  get(id: string): Promise<T | null>;
  save(item: T): Promise<void>;              // create или update
  delete(id: string): Promise<void>;
  subscribe(listener: () => void): () => void;
}

export interface DriverQuery {
  search?: string;
  tkId?: string;
}
export type DriverRepo = CrudRepo<Driver, DriverQuery>;

export interface ShipmentQuery {
  weekNum?: number;
  year?: number;
  status?: Status[];
  driverId?: string;
}
export interface ShipmentRepo extends CrudRepo<Shipment, ShipmentQuery> {
  countByDriver(driverId: string): Promise<number>;
}

export interface PlanRepo extends CrudRepo<WeekPlan, void> {
  byOffset(offset: -1 | 0 | 1): Promise<WeekPlan>;
}

export type TKRepo = CrudRepo<TransportCompany, void>;
export type SupplierRepo = CrudRepo<Supplier, void>;
export type RawRepo = CrudRepo<RawMaterial, void>;
// Phase 1 read-only (для FK consistency с RawMaterial.allowedTara):
export type TaraTypeRepo = CrudRepo<TaraType, void>;
```

---

## 4. LocalStorageRepo

```ts
// src/repos/LocalStorageRepo.ts
const SCHEMA_VERSION = 1;

function migrate(stored: any, fromVersion: number): any {
  // Phase 1: пустая заглушка, точка расширения.
  if (fromVersion < 1) {
    // future migrations
  }
  return stored;
}

export class LocalStorageRepo<T extends { id: string }, Q = void>
  implements CrudRepo<T, Q> {
  private cache: T[] = [];
  private listeners = new Set<() => void>();

  constructor(
    private key: string,                       // 'wsm:v1:drivers'
    private filter?: (item: T, q?: Q) => boolean,
  ) {
    // init cache from LS, run migrate() if needed
  }

  // ... CRUD + subscribe/notify + listSync
}
```

LocalStorage payload schema: `{ schemaVersion: 1, items: [...] }`.
Каждая сущность создаёт инстанс с уникальным ключом. In-memory cache необходим для `listSync` (sync snapshot для `useSyncExternalStore`).

---

## 5. Observer для реактивности

- `subscribe(listener)` → возвращает unsubscribe.
- `save`/`delete` после записи в LS вызывают `notifyAll()` → все listener'ы выполняются.
- **Phase 1: broad notify (notify all listeners on any save/delete).** Phase 2: гранулярная инвалидация по entity+query (см. backlog в [`TASKS.md`](TASKS.md)).
- React-обёртка через `useSyncExternalStore`:

```ts
function useShipments(query: ShipmentQuery) {
  const repo = useShipmentRepo();
  return useSyncExternalStore(
    (cb) => repo.subscribe(cb),
    () => repo.listSync(query),
  );
}
```

Это даёт автоматическую реактивность: PlanView сразу пересчитает факт при сохранении новой Shipment, без manual refresh.

---

## 6. DI через React Context

```ts
// src/repos/RepoContext.tsx
interface Repos {
  shipments: ShipmentRepo;
  drivers: DriverRepo;
  tks: TKRepo;
  suppliers: SupplierRepo;
  raws: RawRepo;
  plans: PlanRepo;
  taraTypes: TaraTypeRepo;   // Phase 1 read-only, для FK consistency
}
const RepoContext = React.createContext<Repos | null>(null);

export const RepoProvider: FC<{ value: Repos; children: ReactNode }> = ...;
export const useShipmentRepo = () => useContext(RepoContext)!.shipments;
// ... аналогично для остальных
```

В `main.tsx`:

```tsx
const repos: Repos = {
  shipments: new LocalStorageShipmentRepo(),
  drivers: new LocalStorageDriverRepo(),
  // ...
  taraTypes: new LocalStorageTaraTypeRepo(),
};
await seedIfEmpty(repos);
root.render(
  <RepoProvider value={repos}>
    <RoleProvider>
      <RouterProvider router={router} />
    </RoleProvider>
  </RepoProvider>,
);
```

---

## 7. Service / domain layer

Бизнес-правила вынесены из React-компонентов в `src/services/`. Pure functions + service-объекты, легко тестируются и переиспользуются.

Состав:

- **`src/services/permissions.ts`** — все `canXxx(...)` helpers (см. [Permission helpers](#permission-helpers)).
- **`src/services/shipmentStatus.ts`**:
  - `canTransitionShipmentStatus(role, from, to): boolean`
  - `nextAllowedStatuses(role, s): Status[]`
  - `transitionShipment(repo, s, to, role): Promise<Shipment>` — выполняет проверку и save.
- **`src/services/planRules.ts`**:
  - `canDeleteVisibleRaw(wp, rawId, shipments): boolean` (I10)
  - `archiveLockApplies(wp): boolean`
  - `computeFactTons(rawId, day, weekShipments): number`
- **`src/services/dateRules.ts`**:
  - `isWorkingDay(d): boolean`
  - `isSunday(d): boolean`
  - `currentWeekId(): { weekNum, year }`
  - `weekIdFromDate(d): { weekNum, year }`
- **`src/services/driverDelete.ts`**:
  - `canDeleteDriver(role, driverId, shipmentRepo): Promise<boolean>`

Pure helpers (`src/lib/`):
- `cell-state.ts` — `getCellState(planTons, factTons)` + `CELL_STYLES`.
- `units.ts` — `kgToTons`, `tonsToKg`, `parseTonsInput`, `formatTons`, `roundToStep`, `formatKg`.
- `validation.ts` — `validateShipment`, `validateDriver`, `validatePlanInput`.
- `phone.ts` — `normalizePhoneRu`, `formatPhoneRu`, `phoneTelUri`.
- `date.ts` — `parseLocalDate`, `formatLocalDate`, `isoWeek`, `dayOfWeekMonStart`, `currentWeekId`.
- `ids.ts` — `newId(prefix)`.
- `raw-colors.ts` — `rawColor(rawId, raws)` helper (читает из `RawRepo`, **не дублирует** seed).
- `week-utils.ts` — `weekRange(weekNum, year)`, `formatWeekLabel`.

---

## Permission helpers

`src/services/permissions.ts`:

```ts
import { Role, Shipment, WeekPlan, Status } from '@/types/domain';
import { ShipmentRepo } from '@/repos/types';

export function canCreateShipment(role: Role): boolean {
  return role === 'admin';
}

export function canEditShipmentCoreFields(role: Role, _s: Shipment): boolean {
  // core: driver, tk, dates, items (rawId, kg, supplierId)
  return role === 'admin';
}

export function canEditShipmentComment(role: Role, _s: Shipment): boolean {
  return role === 'admin' || role === 'operator';
}

export function canEditShipmentItems(role: Role, _s: Shipment): boolean {
  return role === 'admin';
}

export function canDeleteShipment(role: Role, _s: Shipment): boolean {
  return role === 'admin';
}

export function canTransitionShipmentStatus(
  role: Role,
  from: Status,
  to: Status,
): boolean {
  if (from === 'scheduled' && to === 'sent') return role === 'admin';
  if (from === 'sent' && to === 'arrived') {
    return role === 'admin' || role === 'operator';
  }
  return false; // все остальные переходы запрещены (включая scheduled → arrived и обратные)
}

export function canEditWeekPlan(role: Role, wp: WeekPlan): boolean {
  if (wp.archive) return false;
  return role === 'admin';
}

export function canManagePlanVisibleRaws(role: Role, wp: WeekPlan): boolean {
  if (wp.archive) return false;
  return role === 'admin';
}

export function canCrudDrivers(role: Role): boolean {
  return role === 'admin';
}

export async function canDeleteDriver(
  role: Role,
  driverId: string,
  shipmentRepo: ShipmentRepo,
): Promise<boolean> {
  if (!canCrudDrivers(role)) return false;
  const count = await shipmentRepo.countByDriver(driverId);
  return count === 0;
}
```

> **Important**: RoleGate в Phase 1 — UI guard, не security boundary. Backend Phase 3 должен дублировать все эти проверки на стороне сервера. Подробные доменные правила — [`DOMAIN.md`](DOMAIN.md#permission-matrix).

### Future: PermissionGate (Phase 3)

В Phase 3 ожидается переход с role-based на permission-based access:

```tsx
// Phase 3 hypothetical
<PermissionGate require="shipment.delete">
  <Button>Удалить</Button>
</PermissionGate>
```

Текущий RoleGate остаётся для простых case'ов; PermissionGate — для тонкой настройки прав через backend.

---

## 8. RoleGate

```tsx
// src/components/auth/RoleGate.tsx
interface Props {
  allow: Role | Role[];
  fallback?: ReactNode;
  children: ReactNode;
}
export const RoleGate: FC<Props> = ({ allow, fallback = null, children }) => {
  const { role } = useRole();
  const ok = Array.isArray(allow) ? allow.includes(role) : role === allow;
  return ok ? <>{children}</> : <>{fallback}</>;
};
```

Используется для кнопок, столбцов таблиц, gear-иконок, заголовков разделов sidebar, status actions.

> RoleGate скрывает/показывает UI. **Не** проверяет права на действие — для этого используются `canXxx(...)` helpers перед вызовом repo/service методов.

---

## 9. ShipmentsPage state model

```ts
interface ShipmentsPageState {
  view: 'table' | 'heatmap' | 'plan';
  weekNum: number;   // ISO week
  year: number;      // 4-digit
}
```

### URL sync

- URL формат: `/shipments?view=table&week=17&year=2025` (аналог для `heatmap`, `plan`).
- Source of truth: URL (через `useSearchParams`).
- Default при отсутствии query: `view='table'`, `weekNum=currentISOWeek`, `year=currentYear`.
- Переключение view (через `<ViewModeToggle>`) — `setSearchParams({view, week, year})` через `replaceState` (не push, чтобы не засорять history).
- Переключение недели (через WeekNavigator в Heatmap/Plan): `setSearchParams({view: prevView, week: newWeek, year: newYear})`.
- При переключении view week сохраняется (Plan W18 → Heatmap → Heatmap открывается на W18).

### Sub-state (компоненты внутри ShipmentsPage)

- **TableView expand/collapse**: `useState<Set<string>>` для развёрнутых недель и дней. **Phase 1: не персистится.** Default: текущая/выбранная неделя развёрнута, остальные — collapsed.
- **TableView status filter**: `useState<Set<Status>>`. Phase 1 — не персистится. Default: все 3.
- **HeatmapView mode toggle**: `useState<'sum'>` (Phase 1 единственное значение).
- **PlanView gear popover**: local `useState` — open/closed.

> Persistent expanded state через LocalStorage — Phase 2 backlog (см. `TASKS.md`).

---

## 10. i18n / formatting

- **Phase 1**: русский — единственный язык. Hardcoded в компонентах или `*_LABELS`.
- **Числа**: `Intl.NumberFormat('ru-RU')` (тысячи через узкий пробел U+202F).
- **Даты**: `Intl.DateTimeFormat('ru-RU')`. Форматы: «20 апр», «20.04.2025», «21–26 апр 2025».
- **Время**: 24-часовой.
- Если потребуется i18n позже — выносим в JSON с тем же `*_LABELS` API.

---

## 11. Browsers

- Chrome ≥ 120, Edge ≥ 120, Firefox ≥ 120, Safari ≥ 17 (последние 2 минорных).
- Mobile: Phase 3.

---

## 12. Performance

- Phase 1 объёмы: ~50 отгрузок, ~100 позиций, 3 WeekPlan — без оптимизаций OK.
- Heatmap пересчёт через `useMemo` keyed на `[shipments, weekId]`.
- PlanView пересчёт фактов аналогично.

---

## 13. Folder structure

```
/home/nummyn0rih/projects/wsm-design/
  CLAUDE.md                       Claude Code rules
  README.md                       quick-start (создаётся при кодинге)
  .gitignore                      node_modules, dist, .DS_Store, *.local
  .eslintrc.cjs
  .prettierrc
  reference/                      ← frozen reference bundle (не трогать)
  docs/
    PRD.md, DOMAIN.md, IMPLEMENTATION.md, DESIGN.md, ACCEPTANCE.md, TASKS.md
    audit/
    legacy/
  index.html                      Vite entry, fonts preconnect
  vite.config.ts                  alias @ → src
  tsconfig.json                   strict, paths
  package.json                    react@18, react-dom@18, react-router-dom@6,
                                  nanoid, vite, typescript, eslint, prettier,
                                  @typescript-eslint/*, vitest, @types/*
  src/
    main.tsx                      bootstrap (repos, seed, providers, router)
    App.tsx                       <MainShell><Outlet/></MainShell>
    router.tsx                    routes config
    types/
      domain.ts                   все типы и LABELS
    lib/
      cell-state.ts               getCellState + CELL_STYLES
      date.ts                     parseLocalDate, isoWeek, isSunday, currentWeekId
      week-utils.ts               weekRange, formatWeekLabel
      format.ts                   fmtKg, fmtTons, fmtDateRu (Intl wrappers)
      units.ts                    kgToTons, tonsToKg, parseTonsInput, formatTons
      validation.ts               validateShipment, validateDriver, validatePlanInput
      phone.ts                    normalizePhoneRu, formatPhoneRu, phoneTelUri
      ids.ts                      newId(prefix) → 'drv_xxx'
      raw-colors.ts               rawColor(rawId, raws) helper
      __tests__/
        cell-state.test.ts        unit (Vitest)
        validation.test.ts        unit
        units.test.ts             unit
        date.test.ts              unit
        week-utils.test.ts        unit
        phone.test.ts             unit
    services/
      permissions.ts              canCreateShipment, canEditShipmentXxx, ...
      shipmentStatus.ts           canTransitionShipmentStatus, nextAllowedStatuses
      planRules.ts                canDeleteVisibleRaw, archiveLockApplies
      dateRules.ts                isWorkingDay, isSunday helpers wrapper
      driverDelete.ts             canDeleteDriver
      __tests__/
        permissions.test.ts
        shipmentStatus.test.ts
        planRules.test.ts
    styles/
      tokens.css                  --bg, --ink, --raw-*, --status-*
      sketch.css                  .sk-box, .sk-week, .wsm-scroll, .sk-hatch-*
      global.css                  reset + body font/bg
    repos/
      types.ts                    интерфейсы
      LocalStorageRepo.ts         базовый класс
      ShipmentRepo.ts
      DriverRepo.ts
      TKRepo.ts
      SupplierRepo.ts
      RawRepo.ts
      PlanRepo.ts
      TaraTypeRepo.ts             ← Phase 1 read-only, FK consistency
      RepoContext.tsx
    context/
      RoleContext.tsx             useRole hook, LS-persisted, PHASE1_ACTIVE_ROLES filter
    data/seed/
      index.ts                    seedIfEmpty(repos)
      drivers.seed.ts             ~6 drivers (E.164 phones)
      tks.seed.ts                 ~3 TKs
      suppliers.seed.ts           ~7 suppliers
      raws.seed.ts                13 raws; sortOrder (1..13), allowedTara
      taraTypes.seed.ts           ← новый: TaraType records (FK для allowedTara)
      shipments.seed.ts           ~30 shipments × 3 weeks, без Sunday arrDate
      plans.seed.ts               3 WeekPlans (W16 archive, W17 current, W18 next; 2025);
                                  каждый с explicit visibleRaws
    components/
      atoms/
        Box, Label, Pill, HR, StatusChip, RawPill, ProgressBar,
        SegmentedControl, Modal, Toast,
        PhoneField                ← своя маска без библиотек
      auth/
        RoleGate
      dev/
        ResetButton               ← виден только в import.meta.env.DEV
      shell/
        MainShell, Sidebar, SidebarItem, nav-config (с per-role visibility),
        RoleToggle, StubPage
      shipments/
        ShipmentsPage             ← page-level state из URL
        ViewModeToggle
        TableView/
          TableView, WeekHeader, DayHeader, ShipmentRow, ItemLine,
          TableFilters,           ← НЕТ Period dropdown (Phase 2)
          MarkArrivedButton       ← admin+operator, только для status=sent
        HeatmapView/
          HeatmapView, heatmap-utils,
          HeatmapModeToggle       ← "Среднее"/"% плана" disabled+tooltip
        PlanView/
          PlanView, WeekNavigator, PlanGrid, PlanCell,
          VegVisibilityPopover    ← admin only
        DriverModal
        ShipmentFormModal         ← Form E (create / create-from-plan / edit / restricted)
        FormFields/
          DateField               ← native <input type="date">, Sunday block via validation
          SelectField, NumberField, TextField
      references/
        DriversRef, DriverEditModal (admin)
```

---

## Seed strategy

Seed-данные — **сценарные**, не случайные. Покрытие задано в `data/seed/`.

### Required scenarios (acceptance-coupled)

| # | Сценарий | Cover entities |
|---|---|---|
| S1 | Все 6 состояний Plan cell видны на W17 | `plans.seed.ts` + `shipments.seed.ts` |
| S2 | Driver без `Shipment` — для successful delete (Admin) | `drivers.seed.ts` |
| S3 | Driver с `Shipment` — для cascade restrict (Admin) | `drivers.seed.ts` + `shipments.seed.ts` |
| S4 | Все 3 active роли тестируемы через RoleToggle | `RoleContext` default, нет seed |
| S5 | W16/2025 archive — Plan view read-only, TableView edit работает | `plans.seed.ts` (`archive: true`) + `shipments.seed.ts` (W16 shipments) |
| S6 | W17 current (offset=0), W18 next (offset=+1) | `plans.seed.ts` |
| S7 | Heatmap auto-filter: подмножество raw'ов в shipments < `visibleRaws` (на W17) | `shipments.seed.ts` + `plans.seed.ts` |
| S8 | `visibleRaws` protection: ≥1 raw с `plan > 0` (защищён), ≥1 raw с ≥1 shipment (защищён), ≥1 raw свободный | `plans.seed.ts` + `shipments.seed.ts` |
| S9 | Все 3 status (scheduled, sent, arrived) представлены — для проверки прав/transitions | `shipments.seed.ts` |
| S10 | Patmissones с 2 allowedTara (Phase 2 readiness) — пластик + железо | `raws.seed.ts` + `taraTypes.seed.ts` |
| S11 | **Никаких Sunday `arrDate`** во всём seed | `shipments.seed.ts` validation |
| S12 | Operator-editable case: ≥1 Shipment в `sent` для проверки sent→arrived | `shipments.seed.ts` |

### `seedIfEmpty(repos)` flow

```ts
async function seedIfEmpty(repos: Repos) {
  if (localStorage.getItem('wsm:v1:_seeded') === '1') return;

  await Promise.all([
    seedTaraTypes(repos.taraTypes),
    seedRaws(repos.raws),
    seedTks(repos.tks),
    seedSuppliers(repos.suppliers),
  ]);
  await seedDrivers(repos.drivers); // depends on tks
  await seedShipments(repos.shipments); // depends on drivers, raws, suppliers
  await seedPlans(repos.plans); // depends on raws

  localStorage.setItem('wsm:v1:_seeded', '1');
}
```

### Dev reset

`ResetButton` (DEV only): очистка всех `wsm:v1:*` ключей → re-seed → reload. Виден только при `import.meta.env.DEV === true`.

---

## 15. Testing

**Vitest** для unit-тестов pure functions:

| Файл | Покрытие |
|---|---|
| `lib/__tests__/cell-state.test.ts` | Все 6 состояний `getCellState(planTons, factTons)`, граничные (0, 79, 80, 99, 100, 120, 121) |
| `lib/__tests__/validation.test.ts` | `validateShipment` (валидный, пустые items, kg=0, missing driverId, arrDate<shipDate, **Sunday arrDate**); `validateDriver` (short fio, bad phone, missing tkId, long info); `validatePlanInput` (negative, NaN, step normalization) |
| `lib/__tests__/units.test.ts` | `parseTonsInput` (запятая, точка, '', NaN); `formatTons` (ru-RU); `kgToTons` / `tonsToKg`; `roundToStep(0.1)` |
| `lib/__tests__/date.test.ts` | `parseLocalDate` без UTC shift, `isoWeek` edge cases, `isSunday`, `currentWeekId` (mock today) |
| `lib/__tests__/week-utils.test.ts` | «21–26 апр 2025», month-cross weeks |
| `lib/__tests__/phone.test.ts` | `normalizePhoneRu` (`8...`, `+7...`, `7...`, `9...`, invalid); `formatPhoneRu` |
| `services/__tests__/permissions.test.ts` | Все `canXxx` × 3 active роли |
| `services/__tests__/shipmentStatus.test.ts` | All allowed transitions × role; all forbidden transitions return false |
| `services/__tests__/planRules.test.ts` | `canDeleteVisibleRaw` true/false sceneries; `archiveLockApplies` |

**Component-тесты** (RTL) — Phase 2+.
**a11y deep audit** — Phase 2+.

---

## 16. Future API notes

Когда придёт время Phase 2 backend:

1. **Service layer** остаётся UI-facing API; меняется только реализация сервисов и repo.
2. **`CrudRepo<T, Q>` заменяется** на API-layer (например, react-query hooks); `listSync` уходит, появляются loading/error/refetch.
3. **Observer pattern** заменяется на cache invalidation в API client.
4. **Permissions** — двойная проверка: client-side helpers (UX) + backend enforcement (security).
5. **Real auth**: JWT/refresh, persistence per-user, Role/Permission из profile API.
6. **Migration**: schema versioning через `migrate()` (заглушка уже в LocalStorageRepo) расширяется до cross-version миграций.

— конец IMPLEMENTATION.md —
