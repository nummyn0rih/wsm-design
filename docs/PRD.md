# WSM — Учёт отгрузок овощного сырья. PRD v1.3

> **Источник дизайна**: [`../reference/`](../reference/) (полный бандл claude.ai/design). Чаты пользователь↔дизайн-ассистент в `reference/chats/`. Эталонные jsx-прототипы — `reference/project/`.
>
> **Версия 1.3**. Documentation split. PRD остаётся продуктовым источником правды; детальный домен, архитектура, дизайн, acceptance и backlog вынесены в отдельные файлы.

## Documentation map

- **`PRD.md`** (этот файл) — продуктовая спецификация: контекст, цели, роли (high-level), функциональные требования по экранам Core, scope, out of scope.
- [`DOMAIN.md`](DOMAIN.md) — сущности, enum, инварианты, бизнес-правила, status transitions, archive rules, units, dates, phone, validation, weekly vs contract plan.
- [`IMPLEMENTATION.md`](IMPLEMENTATION.md) — стек, repository pattern, service/domain layer, RoleGate, ShipmentsPage URL state, folder structure, seed strategy, testing.
- [`DESIGN.md`](DESIGN.md) — sketch-стиль, цветовые палитры (RawMaterial, StatusChip, Plan cell), ProgressBar, fonts, scrollbar, reference bundle map.
- [`ACCEPTANCE.md`](ACCEPTANCE.md) — verification checklist по ролям + общие проверки.
- [`TASKS.md`](TASKS.md) — phased implementation backlog Phase 1 + Phase 2/3.
- [`../CLAUDE.md`](../CLAUDE.md) — правила Claude Code в этом репозитории.

## Changelog v1.3

```
PRD v1.3 (split into multi-doc)

Roles & permissions (was 2 roles, now 4):
- Role = 'admin' | 'operator' | 'user' | 'director'.
- Phase 1 active: admin, operator, user. Director reserved for Phase 3+, not in RoleToggle.
- Operator: working role for shipments + drivers view only.
- User: strict read-only.
- Sidebar non-admin: invisible items, not disabled/opacity.

Status transitions (strict Variant A):
- Allowed: scheduled → sent, sent → arrived.
- Forbidden: scheduled → arrived direct, all reverse transitions.

Archive scope (clarified):
- WeekPlan.archive=true blocks ONLY Plan view editing + PlanRepo.save.
- TableView, Form E edit/delete, status transitions — independent of archive.

Plan precision: tons, number, step 0.1 (was integer).
ShipmentsPage state synced to URL (view + week + year).
Working week Mon–Sat; Sunday arrDate forbidden by validation.
Units: ShipmentItem.kg (kg, integer); WeekPlan.plan (tons, step 0.1).
Tara: Phase 1 always [], display-only; Phase 2 autogen editable count.
RawMaterial colors: single source in seed (bg/dot fields).
UI placeholders: TableView Period dropdown removed; Heatmap "Среднее"/"% плана" disabled + tooltip.
Architecture: service layer added; CrudRepo is Phase 1 internal contract.
Form E: save blocked until kg>0 for every item; save blocked if shipDate > arrDate.
Edit arrived: per-role, only comment editable for admin/operator.
Seed: scenario-based; no Sunday arrDate.
Weekly plan ≠ contract plan.
```

История прошлых версий — `docs/legacy/PRD-v1.2.md` и git log.

---

## 1. Контекст и цели

### 1.1 Продукт

**WSM (Warehouse / Supplier / Weighbridge Management System)** — учёт отгрузок овощного сырья с фермерских хозяйств на перерабатывающий завод. Система ведёт 13 культур: огурцы, томаты, черри, патиссоны, халапеньо, перец острый, перец сладкий, перец сладкий маринованный, лук, морковь, свёкла, картофель, капуста.

Каждая культура имеет свой календарный сезон поставок (летний/зимний), но это бизнес-факт пользователя — **в модели данных не отражается**. Оператор сам решает, какие овощи актуальны для конкретной недели плана через ⚙ popover в Plan view.

> ⚠ Перец сладкий маринованный приходит на завод уже маринованным от фермера (не процесс на заводе) — полноценный отдельный raw, не подкатегория.

### 1.2 Бизнес-задача

- Прозрачность входящего сырья: что, сколько, от кого, когда поступило (план vs факт).
- Контроль выполнения недельного производственного плана.
- Контроль качества приёмки (брак, нестандарт, калибры) с привязкой к актам (Phase 2).
- Управление оборотом тары (ящики, бочки) между заводом и фермерами (Phase 2).
- Финансовый учёт по контрактам (план vs факт в тоннах и рублях) (Phase 2).
- Печатные формы (Phase 3).

### 1.3 Пользователи и роли

- **Admin** (учётчик / завскладом / руководитель смены): полный доступ ко всем разделам и действиям.
- **Operator** (полевой логист, мобилка): рабочая роль Phase 1. Видит только «Отгрузки» + «Справочники → Водители». Может переходить status `sent → arrived`; может редактировать только `Shipment.comment`. Не может создавать/удалять отгрузки, менять водителя/даты/items, CRUD водителей, редактировать WeekPlan.
- **User** (наблюдатель): строго read-only во всех разделах, которые ему доступны.
- **Director** (директорский дашборд): **зарезервированная** роль для Phase 3+. В Phase 1 — в RoleToggle отсутствует, но в TypeScript типе `Role` присутствует.

Детальная permission-матрица — в [`DOMAIN.md`](DOMAIN.md#permission-matrix).

### 1.4 Scope MVP (Phase 1 — Core)

- Главная страница с тремя режимами просмотра: **Таблица / Heatmap / План**.
- Левый sidebar с навигацией, сворачиваемый, с переключателем роли.
- **RoleToggle** (Admin ↔ Operator ↔ User) — мок без авторизации.
- Справочник «Водители» (просмотр для всех; CRUD только Admin) с полной DriverEditModal.
- **Form E** — создание/редактирование отгрузки (модальное окно: create / create-from-plan / edit; для Operator — restricted mode).
- Модалка «Карточка водителя» — открывается по клику на ФИО в таблице/строке отгрузки.

### 1.5 Out of scope MVP

Краткая выжимка; полный backlog — [`TASKS.md`](TASKS.md#phase-23-backlog):

- Контракты с фермерами (Phase 2).
- Аналитика, KPI, charts (Phase 2).
- Логистика материалов: тара dashboard, отправки, лом (Phase 2).
- Полные справочники: Сырьё, Поставщики, ТК, Виды тары, Сезоны (Phase 2).
- Модалка качества приёмки (Phase 2).
- Уведомления (Phase 3).
- Печатные формы (Phase 3).
- Мобильная версия (Phase 3).
- Реальная авторизация (Phase 3).
- Director dashboard (Phase 3+).

### 1.6 Domain note: weekly plan vs contract plan

Weekly plan (`WeekPlan`) и contract plan (`Contract`) — **разные сущности**:

- **Weekly plan** — оперативный недельный спрос по сырью (сколько тонн каждого сырья должно поступить на завод). Не отвечает «от кого».
- **Contract plan** — сезонное соглашение завод↔фермер: сколько и каких овощей конкретный поставщик обязан поставить за сезон.
- Выбор поставщика для выполнения недельного плана — операционная работа оператора, **не вычисление** из контрактов.
- `WeekPlan` **не выводится автоматически** из `Contract` в Phase 1. Contracts в Phase 2 — для аналитики и финансового учёта план/факт по сезону.

---

## 2. Роли — high-level matrices

### 2.1 Sidebar visibility

| Пункт навигации | Admin | Operator | User | Director (Phase 3+) |
|---|---|---|---|---|
| 📋 Отгрузки | ✓ | ✓ | ✓ | (Phase 3 dashboard) |
| 📦 Логистика материалов | заглушка | скрыто | скрыто | скрыто |
| 📄 Контракты | заглушка | скрыто | скрыто | скрыто |
| 📊 Аналитика | заглушка | скрыто | скрыто | скрыто |
| 🔔 Уведомления | заглушка | скрыто | скрыто | скрыто |
| 📚 Справочники → Водители | ✓ CRUD | ✓ просмотр | ✓ просмотр | скрыто |
| 📚 Справочники → остальные (Сырьё, Поставщики, ТК, Тара, Ингр., Сезоны) | заглушка | скрыто | скрыто | скрыто |
| ⚙ Настройки | заглушка | скрыто | скрыто | скрыто |

«Заглушка» — пункт виден, при клике открывается StubPage «Раздел в работе (Phase N)».
«Скрыто» — пункт **отсутствует** в sidebar (не disabled, не opacity).

### 2.2 Actions matrix (Phase 1)

| Действие | Admin | Operator | User |
|---|---|---|---|
| Просмотр главной (все режимы) | ✓ | ✓ | ✓ |
| Открыть DriverModal | ✓ | ✓ | ✓ |
| Создать Shipment (Form E create) | ✓ | ✗ | ✗ |
| Редактировать Shipment (Form E edit) | ✓ полностью | ✓ restricted (только comment) | ✗ |
| Удалить Shipment | ✓ | ✗ | ✗ |
| Status `scheduled → sent` | ✓ | ✗ | ✗ |
| Status `sent → arrived` | ✓ | ✓ | ✗ |
| Status `scheduled → arrived` | **запрещено всем** | — | — |
| Обратные переходы | **запрещено всем** | — | — |
| Редактировать WeekPlan (input'ы плана) | ✓ | ✗ | ✗ |
| Изменять `WeekPlan.visibleRaws` (gear) | ✓ | ✗ | ✗ |
| Просмотр DriversRef | ✓ | ✓ | ✓ |
| CRUD водителей | ✓ | ✗ | ✗ |

> RoleGate в Phase 1 — **presentation-level guard**, не security boundary. Реальная проверка прав — на backend в Phase 3. Подробности в [`IMPLEMENTATION.md`](IMPLEMENTATION.md#permission-helpers).

---

## 3. Функциональные требования по экранам Core

### 3.0 ShipmentsPage — page-level state

Главная страница (`/shipments`) держит общее состояние для всех трёх режимов:

```ts
interface ShipmentsPageState {
  view: 'table' | 'heatmap' | 'plan';
  weekNum: number;   // ISO week
  year: number;      // 4-digit
}
```

**URL формат**: `/shipments?view=table&week=17&year=2025` (аналогично для `heatmap`, `plan`).

Правила:
- При отсутствии query-params: `view=table`, `weekNum=currentISOWeek`, `year=currentYear`.
- При переключении view (Table → Heatmap → Plan): `week` и `year` **сохраняются**. Если пользователь в Plan W18 переключается в Heatmap — Heatmap открывается на W18.
- При навигации между неделями — URL обновляется через `replaceState`.
- `currentWeek` = ISO-неделя сегодняшнего дня.

### 3.1 Режим «Таблица»

_Источник: `reference/project/Wireframes.html` L547–960 (VariantA), L286–421 (Shipment row, ItemLine)._

#### Группировка

- Двухуровневая: **Неделя → День → Отгрузки** (аккордеон).
- Заголовок недели: чёрная плашка (см. [`DESIGN.md`](DESIGN.md)). Формат: «Неделя 17 · 21–26 апр 2025».
- Заголовок дня: тёмно-серая плашка. Формат: «ПН 21 апр · 4 отгрузки».
- Свёртка: клик по заголовку недели или дня — collapse/expand. **Phase 1**: `useState` only, не персистится. Default expanded — текущая или выбранная неделя.
- TableView показывает **все** недели; focus и default-expand на selected (из page state).

#### Фильтры

- **Статус**: три чекбокса (`scheduled`, `sent`, `arrived`). По умолчанию все три включены. Persisted: `useState` only.
- **Period dropdown** — **удалён в v1.3**. Период-фильтр перенесён в Phase 2.
- Поиск, фильтр по поставщику/ТК — Phase 2.

#### Строка отгрузки (Shipment row)

Колонки:
1. Дата отгрузки (`shipDate`) — формат «20 апр».
2. Дата поступления (`arrDate`) — формат «21 апр».
3. ФИО водителя — кликабельно → DriverModal.
4. ТК — название (`TransportCompany.name`).
5. Статус — `<StatusChip status="..."/>`.
6. **Action «✓ Отметить прибывшим»** — иконка справа от StatusChip. Показывается **только** для `status === 'sent'`. Доступна Admin и Operator. Клик → confirm dialog → транзишен `sent → arrived`.
7. № акта — Phase 2 (placeholder в Phase 1).
8. Σ вес — суммарный вес всех позиций, в кг.
9. Кол-во позиций — пилл «N позиций».
10. Опц. комментарий — italic, оранжевый.
11. **Action «✏ Редактировать»** — открывает Form E в edit-mode. Admin — полный edit; Operator — restricted (только comment); User — скрыто.
12. **Action «🗑 Удалить»** — только Admin, confirm dialog.

#### Action кнопки top-of-page

- **«+ Новая отгрузка»** — только Admin. Открывает Form E в create mode.

> **Archive note**: TableView показывает и редактирует Shipment **независимо** от `WeekPlan.archive`. Архивность касается только Plan view.

### 3.2 Режим «Heatmap»

_Источник: `reference/project/pivot-summary.jsx` L110–209._

- **Строки**: овощи, у которых есть `∃ ShipmentItem` с этим `rawId` и `arrDate` в выбранной неделе. Auto-filter. Sort by `RawMaterial.sortOrder` ASC. **Не зависит** от `WeekPlan.visibleRaws`.
- **Колонки**: 6 дней недели (ПН–СБ).
- **Ячейка**: суммарный вес (кг) по `ShipmentItem` с этим сырьём и днём, **все 3 статуса**.

#### Контролы

- Переключатель внизу: «Сумма (кг)» (активна), «Среднее за день» и «% от плана недели» — `disabled` + `aria-disabled="true"` + tooltip «Phase 2».
- Селектор недели: ← Пред / Сегодня / След →. Source of truth — page state. URL обновляется.

#### Тоталы

- Колонка «Итого за неделю» справа.
- Строка «Итого за день» снизу.
- Угловая ячейка — total недели.

### 3.3 Режим «План»

_Источник: `reference/project/plan-view.jsx` L470–1430._

#### Структура

- Таблица: N видимых овощей × 6 дней (ПН–СБ), где `N = WeekPlan.visibleRaws.length`.
- Сортировка строк по `RawMaterial.sortOrder` ASC.
- Ячейка:
  - **Plan input** (тонны, `number`, шаг **0.1**, right-aligned). UI принимает запятую или точку; хранение всегда `number`. Подробности — [`DOMAIN.md`](DOMAIN.md#units).
  - Computed fact (тонны) + пилл состояния.
  - ProgressBar 0–150% с маркером на 100%.
  - Если ≥1 shipment — иконка «N отгр.» внизу.
  - Клик по ячейке → Form E с префиллом `{rawId, day, weekNum, year}` → **всегда новая** Shipment.

Логика 6 состояний ячейки (`empty`, `emptyOver`, `short`, `close`, `norm`, `over`) — [`DOMAIN.md`](DOMAIN.md#cell-state-rule), визуальная палитра — [`DESIGN.md`](DESIGN.md#plan-cell-palette).

#### Empty state

`WeekPlan.visibleRaws = []` → empty state с per-role текстом:
- **Admin**: «План не создан. Отметьте овощи для планирования через ⚙».
- **Operator / User**: «План не создан. Обратитесь к администратору для настройки овощей недели».

#### Видимость овощей (gear popover)

- ⚙ доступен **только Admin**. У Operator/User скрыт.
- Клик → popover со списком всех 13 овощей (плоский, sorted by `sortOrder` ASC) + чекбоксы.
- `visibleRaws: string[]` хранится **внутри** `WeekPlan`. Per-week.
- Защита от скрытия (инвариант I10 в [`DOMAIN.md`](DOMAIN.md#invariants)): нельзя снять `rawId`, если есть план > 0 или ≥1 отгрузка за неделю.
- **Поставить галку — всегда можно**.

#### Архивная неделя

`WeekPlan.archive=true`:
- Plan input'ы readonly.
- ⚙ скрыт.
- Клик по plan-cell не открывает Form E.
- Pill «🔒 Архив» в шапке Plan view.

> **Archive scope** касается **только Plan view и `PlanRepo.save`**. TableView, Form E edit/delete, status transitions, mark-arrived — работают свободно. См. [`DOMAIN.md`](DOMAIN.md#archive-rules).

#### Редактирование плана

- Admin only. Operator/User — input'ы read-only.
- `onBlur` → `PlanRepo.save(updatedWeek)` с debounce 300 мс.
- Локально оптимистичное обновление.

#### Подвал

- Тоталы недели: сумма plan, fact, % выполнения, overall progress.

### 3.4 Модалка карточки водителя

_Источник: `reference/project/Wireframes.html` L433–544._

#### Поля

| Поле | Источник | Действие |
|---|---|---|
| ФИО | `Driver.fio` | — |
| Телефон | `Driver.phone` (E.164) → `formatPhoneRu` | «📋 копировать» → `navigator.clipboard.writeText(formatPhoneRu(phone))` |
| ТК | `Driver.tkId` → `TransportCompany.name` | — |
| Доп. инфо | `Driver.info` | — |

#### Действия

- Закрытие: ✕ или backdrop click.
- «Открыть карточку ТК» — disabled Phase 2.
- Admin: «Редактировать водителя» → `<DriverEditModal>`.

### 3.5 Form E — Создание/Редактирование отгрузки

_Источник: `reference/project/Wireframes.html` L1346–1488, `reference/project/plan-view.jsx` L1168–1428._

#### Контексты вызова

1. **Прямой create** (Admin only): «+ Новая отгрузка» → пустая форма.
2. **Create from plan cell** (Admin only, не архивная неделя): клик по plan-cell → префилл `rawId`, `arrDate` (locked), `kg=0` (draft, save заблокирован).
3. **Edit** (Admin полный, Operator restricted): «✏ Редактировать» в строке.

#### Поля шапки

| Поле | Тип | Обязательно | Дефолт | Валидация |
|---|---|---|---|---|
| Дата отгрузки | `date` | ✓ | пусто | — |
| Дата поступления | `date` | ✓ | префилл в plan-mode (locked); иначе `shipDate + 1 day` | ≥ Дата отгрузки; **не воскресенье** (см. [`DOMAIN.md`](DOMAIN.md#dates-working-week)) |
| Водитель | `select` | ✓ | пусто | выбор из DriverRepo |
| ТК | `select` | — | автозаполнено по водителю (readonly) | пересчёт при смене водителя |
| Комментарий | textarea | — | пусто | max 200 |

> Статус **не задаётся** полем шапки. Определяется кнопками footer'а (create) или edit-actions (edit).

#### Позиции (ShipmentItem rows)

| Поле | Тип | Обязательно | Дефолт | Валидация |
|---|---|---|---|---|
| № | counter | — | 1,2,3… | автономер |
| Сырьё | `select` | ✓ | пусто (или префилл plan-mode, locked) | из RawRepo |
| Вес, кг | `number` | ✓ | пусто (0 в plan-mode draft) | `> 0` integer; save блокируется при kg=0 |
| Поставщик | `select` | ✓ | пусто | из SupplierRepo |
| ✕ | action | — | — | disabled если items.length === 1 |

**Тара**: в Form E **не редактируется**. Phase 1 — `ShipmentItem.tara = []` всегда. Phase 2 — автогенерация (см. [`DOMAIN.md`](DOMAIN.md#tara-rules)).

#### Суммарная панель

`Σ {sumKg} кг` · `{N} позиций` · `{N} поставщиков`. Тара не агрегируется.

#### Действия footer'а (create mode)

| Кнопка | Действие | Доступность |
|---|---|---|
| Отмена | закрыть без save | всегда |
| Сохранить как запланировано | save со `status='scheduled'` | если валидация прошла |
| ✓ Сохранить и отправить | save со `status='sent'` | если валидация прошла |

#### Inline validation (блокирует save)

- Минимум 1 позиция.
- Каждая позиция: `rawId`, `kg > 0`, `supplierId` заполнены. **Save заблокирован, пока хотя бы одна позиция имеет `kg <= 0`**; inline error «Введите вес > 0».
- Шапка: `shipDate`, `arrDate`, `driverId` заполнены.
- `arrDate >= shipDate`. Иначе inline error «Дата поступления должна быть ≥ даты отгрузки» — save заблокирован.
- `arrDate` не воскресенье. Inline error «Воскресенье — нерабочий день. Выберите ПН–СБ».

#### Edit mode — actions по статусу × роли

| Status | Admin | Operator | User |
|---|---|---|---|
| `scheduled` | Сохранить (full edit), Отправить (→ sent), Удалить | Сохранить (только comment), статус-действия скрыты, Удалить скрыто | edit mode недоступен |
| `sent` | Сохранить (full edit), Отметить прибывшим (→ arrived), Удалить | Сохранить (только comment), Отметить прибывшим, Удалить скрыто | edit mode недоступен |
| `arrived` | Сохранить (только comment, поля акта — Phase 2), Удалить | Сохранить (только comment), Удалить скрыто | edit mode недоступен |

Restricted mode (Operator): все поля read-only, кроме `comment`. Add/remove `ShipmentItem` disabled. Status actions — только разрешённые (`sent → arrived`).

Обратные переходы запрещены всем. Status matrix — [`DOMAIN.md`](DOMAIN.md#status-transitions).

#### Поведение после save

- Модалка закрывается.
- `ShipmentRepo.save(shipment)`.
- Observer уведомляет TableView, HeatmapView, PlanView — автоматический rerender.
- Toast «Отгрузка сохранена» (4с).

### 3.6 Справочник «Водители»

_Источник: `reference/project/references-extras.jsx` L92–220._

#### Колонки таблицы

| Колонка | Поле |
|---|---|
| ФИО | `Driver.fio` |
| Телефон | `formatPhoneRu(Driver.phone)` |
| ТК | `TransportCompany.name` |
| Доп. инфо | `Driver.info` (truncate) |
| Действия (Admin only) | ✏ редактировать · 🗑 удалить (или disabled при cascade restrict) |

#### Фильтры

- **Поиск** — input по ФИО и телефону (live filter, debounce 200мс). Телефон-поиск нормализует ввод через `normalizePhoneRu` перед сравнением.
- **Фильтр ТК** — multiselect dropdown.

#### Действия

- **Admin**: «+ Новый водитель» → `<DriverEditModal>` пустая; ✏ → префилл; 🗑 → confirm → `DriverRepo.delete(id)`.
  - **Cascade restrict** (инвариант I6): если есть `Shipment.driverId === this.id`, 🗑 disabled, tooltip «Используется в N отгрузках».
- **Operator / User**: только просмотр + поиск/фильтр. Create/edit/delete buttons скрыты.

#### DriverEditModal (Admin only Phase 1)

| Поле | Тип | Валидация |
|---|---|---|
| ФИО | text | min 2 |
| Телефон | `<PhoneField>` | regex `^\+7\d{10}$` после нормализации |
| ТК | select | непустое |
| Доп. инфо | textarea | max 500 |

«Сохранить» → `DriverRepo.save(driver)`. «Отмена» → закрыть. Detalils по `<PhoneField>` — [`DOMAIN.md`](DOMAIN.md#phone-storage).

---

## 4. Phase 1 acceptance

См. [`ACCEPTANCE.md`](ACCEPTANCE.md). Чек-листы разнесены по ролям: Admin / Operator / User + общие (Routing, Persistence, Aesthetics, Tests, Dev tools).

---

## 5. Roadmap

См. [`TASKS.md`](TASKS.md):

- **Phase 1 (Core)** — этот документ. Главная (3 режима) + Sidebar + RoleToggle + DriversRef + Form E + DriverModal.
- **Phase 2 (Бизнес-разделы)** — Контракты, Аналитика, Логистика материалов, остальные справочники, модалка качества, tara autogen.
- **Phase 3 (Кросс-функциональное)** — Уведомления, Печать, Мобилка, Настройки, реальная авторизация, PermissionGate, Director dashboard.

— конец PRD v1.3 —
