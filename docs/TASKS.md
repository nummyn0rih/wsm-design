# WSM — Phased Implementation Backlog

> Phase 1 milestones (linear checklist) + Phase 2/3 backlog. Acceptance — отдельно в [`ACCEPTANCE.md`](ACCEPTANCE.md).

## Contents

1. [Phase 1 — Core](#phase-1--core)
2. [Phase 2 — Бизнес-разделы](#phase-2--бизнес-разделы)
3. [Phase 3 — Кросс-функциональное](#phase-3--кросс-функциональное)

---

## Phase 1 — Core

Этот документ финализирован после approval PRD v1.3. Кодинг начинается только по явному запросу пользователя.

### M0 — Documentation finalization (DONE)

- [x] PRD v1.3 split на 7 документов.
- [x] CLAUDE.md в корне.
- [x] `docs/audit/PRD-v1.3-audit.md` — артефакт принятия решений.
- [x] `docs/legacy/PRD-v1.2.md` — snapshot предыдущей версии.

### M1 — Project setup

- [ ] `package.json` с зависимостями: `react@18`, `react-dom@18`, `react-router-dom@6`, `nanoid`, `vite`, `typescript`, `eslint`, `prettier`, `@typescript-eslint/*`, `vitest`, `@types/*`.
- [ ] `vite.config.ts` с alias `@ → src`.
- [ ] `tsconfig.json` со `strict: true` и paths.
- [ ] `.eslintrc.cjs`, `.prettierrc`.
- [ ] `index.html` — fonts preconnect (Caveat, JetBrains Mono).
- [ ] `src/main.tsx` — bootstrap скелет.
- [ ] `src/App.tsx` — `<MainShell><Outlet/></MainShell>`.
- [ ] `src/router.tsx` — routes config (`/shipments`, `/references/drivers`, fallback `<StubPage>`).
- [ ] `src/styles/tokens.css`, `sketch.css`, `global.css`.
- [ ] `README.md` quick-start.

**Acceptance**: `npm run dev` запускается, пустая страница без ошибок console.

### M2 — Domain types + utilities

- [ ] `src/types/domain.ts` — все типы и `*_LABELS` константы согласно [`DOMAIN.md#3-typescript-types`](DOMAIN.md#3-typescript-types).
- [ ] `src/lib/ids.ts` — `newId(prefix)`.
- [ ] `src/lib/date.ts` — `parseLocalDate`, `formatLocalDate`, `isoWeek`, `dayOfWeekMonStart`, `isSunday`, `currentWeekId`.
- [ ] `src/lib/week-utils.ts` — `weekRange`, `formatWeekLabel`.
- [ ] `src/lib/units.ts` — `kgToTons`, `tonsToKg`, `parseTonsInput`, `formatTons`, `roundToStep`, `formatKg`.
- [ ] `src/lib/cell-state.ts` — `getCellState` + `CELL_STYLES`.
- [ ] `src/lib/validation.ts` — `validateShipment`, `validateDriver`, `validatePlanInput`.
- [ ] `src/lib/phone.ts` — `normalizePhoneRu`, `formatPhoneRu`, `phoneTelUri`.
- [ ] `src/lib/format.ts` — `fmtKg`, `fmtTons`, `fmtDateRu` (Intl wrappers).
- [ ] `src/lib/raw-colors.ts` — `rawColor(rawId, raws)` helper (читает из repo).

**Dependencies**: M1.

### M3 — Service / domain layer

- [ ] `src/services/permissions.ts` — все `canXxx(...)` согласно [`IMPLEMENTATION.md#permission-helpers`](IMPLEMENTATION.md#permission-helpers).
- [ ] `src/services/shipmentStatus.ts` — `canTransitionShipmentStatus`, `nextAllowedStatuses`, `transitionShipment`.
- [ ] `src/services/planRules.ts` — `canDeleteVisibleRaw`, `archiveLockApplies`, `computeFactTons`.
- [ ] `src/services/dateRules.ts` — `isWorkingDay`, `isSunday` (re-export из `lib/date`).
- [ ] `src/services/driverDelete.ts` — `canDeleteDriver`.

**Dependencies**: M2.

### M4 — Repos and seed data

- [ ] `src/repos/types.ts` — интерфейсы `CrudRepo`, `DriverRepo`, `ShipmentRepo`, etc.
- [ ] `src/repos/LocalStorageRepo.ts` — базовый класс с in-memory cache, observer, `migrate()` заглушкой.
- [ ] `src/repos/ShipmentRepo.ts` — extends LocalStorageRepo + `countByDriver`.
- [ ] `src/repos/DriverRepo.ts`, `TKRepo.ts`, `SupplierRepo.ts`, `RawRepo.ts`, `PlanRepo.ts` (+`byOffset`), `TaraTypeRepo.ts` (read-only).
- [ ] `src/repos/RepoContext.tsx` — provider + hooks.
- [ ] `src/data/seed/index.ts` — `seedIfEmpty(repos)`.
- [ ] `src/data/seed/taraTypes.seed.ts` — `TaraType` records.
- [ ] `src/data/seed/raws.seed.ts` — 13 raws с `sortOrder`, `allowedTara`, `bg`, `dot`.
- [ ] `src/data/seed/tks.seed.ts` — 3 TKs.
- [ ] `src/data/seed/suppliers.seed.ts` — 7 suppliers.
- [ ] `src/data/seed/drivers.seed.ts` — 6 drivers с E.164 phones (включая driver без shipments и driver с shipments).
- [ ] `src/data/seed/shipments.seed.ts` — 30 shipments × 3 weeks (W16/W17/W18 2025); все статусы; **никаких Sunday arrDate**; покрытие seed scenarios S1–S12.
- [ ] `src/data/seed/plans.seed.ts` — 3 WeekPlans (W16 archive, W17 current, W18 next); explicit `visibleRaws` для каждого; покрытие всех 6 cell states.

**Dependencies**: M2, M3.

### M5 — Shell / Sidebar / RoleToggle

- [ ] `src/context/RoleContext.tsx` — `useRole` hook, LS-persisted, filter по `PHASE1_ACTIVE_ROLES`.
- [ ] `src/components/atoms/` — Box, Label, Pill, HR, StatusChip, RawPill, ProgressBar, SegmentedControl, Modal, Toast.
- [ ] `src/components/atoms/PhoneField.tsx` — своя маска ввода, ~30 строк.
- [ ] `src/components/auth/RoleGate.tsx`.
- [ ] `src/components/shell/MainShell.tsx`, `Sidebar.tsx`, `SidebarItem.tsx`, `nav-config.ts` (с per-role visibility), `RoleToggle.tsx`, `StubPage.tsx`.

**Dependencies**: M2, M4.

### M6 — TableView

- [ ] `src/components/shipments/ShipmentsPage.tsx` — page-level state из URL.
- [ ] `src/components/shipments/ViewModeToggle.tsx`.
- [ ] `src/components/shipments/TableView/TableView.tsx`.
- [ ] `WeekHeader.tsx`, `DayHeader.tsx`, `ShipmentRow.tsx`, `ItemLine.tsx`.
- [ ] `TableFilters.tsx` — **только status checkboxes**, без Period dropdown.
- [ ] `MarkArrivedButton.tsx` — admin+operator, только для status=sent.

**Dependencies**: M4, M5.

### M7 — HeatmapView

- [ ] `src/components/shipments/HeatmapView/HeatmapView.tsx`.
- [ ] `heatmap-utils.ts` — `heatBg(rawId, v, maxV)`, week aggregation.
- [ ] `HeatmapModeToggle.tsx` — «Сумма (кг)» активна, «Среднее»/«% плана» disabled + tooltip.
- [ ] WeekNavigator — общий компонент для Heatmap и Plan (использует page state).

**Dependencies**: M4, M5.

### M8 — PlanView

- [ ] `src/components/shipments/PlanView/PlanView.tsx`.
- [ ] `PlanGrid.tsx`, `PlanCell.tsx`.
- [ ] `VegVisibilityPopover.tsx` — admin only.
- [ ] Empty state per-role.
- [ ] Archive lock UI (input readonly, gear скрыт, pill «🔒 Архив»).
- [ ] Plan input — decimal tons, step 0.1, ru-RU локаль.

**Dependencies**: M4, M5.

### M9 — Shipment Form E

- [ ] `src/components/shipments/ShipmentFormModal.tsx` — универсальная модалка (create / create-from-plan / edit / restricted).
- [ ] `FormFields/DateField.tsx` — native `<input type="date">` + Sunday-block validation.
- [ ] `FormFields/SelectField.tsx`, `NumberField.tsx`, `TextField.tsx`.
- [ ] Inline validation для всех save-block rules ([`DOMAIN.md#validation`](DOMAIN.md#validation)).
- [ ] Edit-mode actions matrix per-(status, role).

**Dependencies**: M4, M5, M8.

### M10 — DriversRef

- [ ] `src/components/references/DriversRef.tsx`.
- [ ] `src/components/references/DriverEditModal.tsx` (admin only).
- [ ] DriverModal (открывается с любой страницы по клику на ФИО).

**Dependencies**: M5.

### M11 — Unit tests

- [ ] `src/lib/__tests__/*` — все pure functions ([`ACCEPTANCE.md#5-tests-unit-vitest`](ACCEPTANCE.md#5-tests-unit-vitest)).
- [ ] `src/services/__tests__/*` — все services.
- [ ] `npm run test` зелёный.

**Dependencies**: M2, M3.

### M12 — Dev tools

- [ ] `src/components/dev/ResetButton.tsx` — `import.meta.env.DEV` only.

**Dependencies**: M5.

### M13 — Polish & Acceptance

- [ ] Прогон всего ACCEPTANCE checklist вручную с тремя ролями (Admin / Operator / User).
- [ ] Финальный `npm run build` + `npm run preview` — production OK.
- [ ] Phase 1 release tag.

**Dependencies**: M1–M12.

---

## Phase 2 — Бизнес-разделы

### Большие разделы (UI)

| Раздел | Reference |
|---|---|
| Контракты с фермерами (список, форма, карточка с прогрессом, сравнение сезонов) | `reference/project/contracts.jsx` |
| Аналитика (KPI, charts, slice constructor, supplier rankings, defects %, calibers) | `reference/project/analytics.jsx` |
| Логистика материалов (Tara dashboard, отправки, лом, передачи, журнал, ингредиенты) | `reference/project/logistics.jsx` |
| Справочник Сырьё (карточки с qualityParams) | `reference/project/raw-quality.jsx` |
| Справочник Поставщики (6 табов: info/contacts/contracts/history/tara/quality) | `reference/project/supplier-card-tabs.jsx` |
| Справочники ТК, Виды тары, Ингредиенты, Сезоны | `reference/project/references-extras.jsx` |
| Модалка качества приёмки (qualityParams, калибры, PDF, акт) | `reference/project/quality-modal.jsx` |

### Точечные функции

| Функция | Обоснование |
|---|---|
| Поиск по таблице отгрузок (ФИО, поставщик, № акта) | UX |
| Inline-создание `Supplier` прямо из Form E | UX |
| Inline-создание `TransportCompany` прямо из Form E | UX |
| Гранулярная Repo invalidation (по entity+query) | Перформанс |
| Обратные переходы статусов отгрузки | Корректура без delete+recreate |
| Фильтр по поставщику / ТК в TableView | UX |
| **TableView Period dropdown** (восстановлен) с реальной фильтрацией | UX |
| **TableView persistent expanded/collapsed state** в LocalStorage | UX |
| Component-тесты (RTL) | Coverage |
| Глубокий a11y audit | Compliance |
| Справочник «Виды тары» (`TaraType` CRUD) | Раздел из sidebar |
| Норматив загрузки (`TaraLoadNorm`): supplier × raw × taraType → fullTruckKg + fullTruckCount | Пререкв для tara autogen |
| Автогенерация `ShipmentItem.tara` при создании Shipment (см. [`DOMAIN.md#tara-rules`](DOMAIN.md#tara-rules)) | Ключевая бизнес-механика |
| UI выбора типа тары в Form E для сырья с ≥2 `allowedTara` | Патиссоны: пластик/железо |
| Editable `tara.count` после автогенерации | Неполная загрузка |
| Тарные отправки `TaraShipment` (форма 6.2) завод → фермер | Логистика |
| Тарные перемещения фермер → фермер | Подвид `TaraShipment` |
| Остатки тары у фермеров (балансы) | Производное от `TaraShipment` + `ShipmentItem.tara` |
| Учёт лома и списания тары | Раздел логистики |
| Журнал движений тары (audit-trail) | Раздел логистики |
| UI редактирования `RawMaterial.sortOrder` (drag-and-drop) | Поле есть в Phase 1 |
| `TransportCompany.shortName` (если потребуется) | Если name слишком длинный |

---

## Phase 3 — Кросс-функциональное

| Раздел | Reference |
|---|---|
| Уведомления (popover в шапке, страница, фильтры, действия) | `reference/project/notifications.jsx` |
| Печатные формы (реестр A4 портрет, сводка A4 ландшафт) | `reference/project/print-views.jsx` |
| Мобилка: list, detail, form (Android frame) | `reference/project/mobile-list.jsx`, `mobile-detail-form.jsx` |
| Мобилка: tara + analytics | `reference/project/mobile-tara-analytics.jsx` |
| Настройки (alerts, тара, рабочая неделя, единицы, users/roles, бэкап, about) | `reference/project/settings.jsx` |
| Реальная авторизация (login, JWT, refresh) | — |
| **PermissionGate** (permission-based access вместо role-based) | См. [`IMPLEMENTATION.md#permission-helpers`](IMPLEMENTATION.md#permission-helpers) |
| **Director dashboard** (role=director активна, KPI homepage) | `reference/project/settings.jsx` L632 |
| Бэкап/экспорт CSV/Excel | `reference/project/settings.jsx` |
| Backend API + миграция с LocalStorage | См. [`IMPLEMENTATION.md#16-future-api-notes`](IMPLEMENTATION.md#16-future-api-notes) |

---

## Out of scope (никакой фазы)

| Раздел | Reason |
|---|---|
| Design canvas | Только в reference |
| Android frame | UI library only, не часть приложения |

— конец TASKS.md —
