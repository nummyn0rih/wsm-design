# WSM — Phase 1 Acceptance Checklist

> Verification checklist для Phase 1 Core. Разнесён по ролям (Admin / Operator / User) + общие проверки (Routing, Persistence, Aesthetics, Tests, Dev tools). Каждый пункт проверяется вручную или unit-тестом.

## Contents

1. [Общие проверки](#1-общие-проверки)
2. [Admin checks](#2-admin-checks)
3. [Operator checks](#3-operator-checks)
4. [User checks](#4-user-checks)
5. [Tests (unit, Vitest)](#5-tests-unit-vitest)
6. [Dev tools](#6-dev-tools)

---

## 1. Общие проверки

### 1.1 Базовый запуск

- [ ] `npm install && npm run dev` запускает приложение на `http://localhost:5173` без ошибок.
- [ ] `tsc --noEmit` — без ошибок (strict mode).
- [ ] `npm run lint` — без ошибок.
- [ ] `npm run test` — все Vitest тесты зелёные.
- [ ] `npm run build` — production build проходит.
- [ ] Первый запуск с пустым LocalStorage — выполняется seed; ключ `wsm:v1:_seeded=1`; все entity-ключи появляются.
- [ ] `.gitignore` корректен (node_modules, dist, .DS_Store, *.local).
- [ ] `README.md` содержит quick-start `npm i && npm run dev`.

### 1.2 Routing

- [ ] `/` редиректит на `/shipments`.
- [ ] `/shipments` рендерит `ShipmentsPage` с default `view=table`, `week=<currentISOWeek>`, `year=<currentYear>` если query пустые.
- [ ] `/shipments?view=heatmap&week=17&year=2025` рендерит Heatmap W17/2025.
- [ ] `/shipments?view=plan&week=18&year=2025` рендерит Plan W18/2025.
- [ ] Переключение Table → Heatmap при `?week=18&year=2025` → Heatmap открывается на W18.
- [ ] Переключение Plan → Table при `?week=16&year=2025` → Table focused на W16.
- [ ] WeekNavigator (Heatmap/Plan) меняет URL через `replaceState`, не push.
- [ ] `/references/drivers` рендерит DriversRef.
- [ ] Несуществующий путь рендерит StubPage «Раздел в работе».
- [ ] BrowserRouter работает (прямой ввод URL).

### 1.3 Persistence

- [ ] Содержимое LS соответствует схеме `{ schemaVersion: 1, items: [...] }` для каждого entity-ключа.
- [ ] Очистка LS и рефреш → seed срабатывает заново.
- [ ] Repo observer: создание Shipment в Form E → автоматическое обновление TableView, HeatmapView, PlanView без явных refetch.
- [ ] Рефреш страницы → role сохранён (LS `wsm:v1:role`).
- [ ] Рефреш страницы → URL state восстановлен (view/week/year из query).
- [ ] В LS `wsm:v1:shipments`: каждая запись имеет `items[].tara = []` (Phase 1).
- [ ] В LS `wsm:v1:drivers`: `phone` хранится в E.164 (`+79012345678`).

### 1.4 Sidebar

- [ ] Sidebar сворачивается в 56px при клике на бургер; разворачивается обратно в 230px.
- [ ] Caveat font загружен в Label.
- [ ] RoleToggle отображает **только 3 active** роли (Admin / Operator / User). Director **отсутствует**.

### 1.5 TableView (общее)

- [ ] Отображаются все 3 недели (W16 архив, W17 текущая, W18 следующая) из сидов.
- [ ] Default expanded = selected (или current) week. Остальные collapsed.
- [ ] Клик по заголовку недели разворачивает/сворачивает.
- [ ] Клик по заголовку дня разворачивает/сворачивает.
- [ ] Колонки строки отгрузки: дата отгрузки, дата поступления, ФИО, ТК (name), статус, action, № акта (placeholder), Σ кг, кол-во позиций, комментарий, edit, delete.
- [ ] ФИО водителя кликабельно → DriverModal.
- [ ] **Period dropdown ОТСУТСТВУЕТ** (удалён в Phase 1).
- [ ] Status checkboxes (`scheduled`, `sent`, `arrived`) работают независимо.
- [ ] При фильтре статусов отображение обновляется live.

### 1.6 HeatmapView (общее)

- [ ] При переключении Table → Heatmap отображается сетка raw'ов × 6 дней.
- [ ] Auto-filter: показываются только raw'ы с ≥1 shipment за неделю (независимо от `visibleRaws`).
- [ ] Цвета ячеек соответствуют `RawMaterial.bg`, интенсивность ~ объёму.
- [ ] Тоталы строк, столбцов и угла корректны.
- [ ] Селектор недели работает; W17 → W18 → W16 (archive).
- [ ] Факт ячейки включает все 3 статуса.
- [ ] **«Сумма (кг)»** — активная кнопка.
- [ ] **«Среднее за день»** — disabled + tooltip «Phase 2».
- [ ] **«% от плана недели»** — disabled + tooltip «Phase 2».

### 1.7 PlanView (общее)

- [ ] Для W17 (current) с заполненным `visibleRaws` рендерится сетка N × 6 дней.
- [ ] Строки отсортированы по `RawMaterial.sortOrder` ASC.
- [ ] Все 6 цветовых состояний ячеек видны на seed-данных (`empty`, `emptyOver`, `short`, `close`, `norm`, `over`).
- [ ] Маркер 100% виден на каждом ProgressBar.
- [ ] Штриховка над 100% видна для overcommit-ячейки.
- [ ] Тоталы недели в подвале (sum plan, fact, %, overall progress).
- [ ] **Heatmap НЕ использует `visibleRaws`** — независимый auto-filter.

### 1.8 PlanView — Archive week (W16/2025)

- [ ] Input'ы плана `readonly`.
- [ ] ⚙ кнопка скрыта (для **любой** роли).
- [ ] Клик по plan-cell **не открывает** Form E (silent disabled, без тоста).
- [ ] Pill «🔒 Архив» в шапке.
- [ ] **TableView для W16: edit/delete/mark-arrived работают как обычно** (archive scope не блокирует Shipment).
- [ ] Form E можно открыть из TableView на W16 shipment.

### 1.9 Form E (общее: validation + view)

- [ ] Поле «Дата отгрузки» автозаполняет «Дата поступления» = +1 день.
- [ ] Если рассчитанная `arrDate` попадает на воскресенье → inline error «Воскресенье — нерабочий день. Выберите ПН–СБ»; save заблокирован.
- [ ] Ручной выбор `arrDate` в воскресенье → та же inline error.
- [ ] Выбор водителя автозаполняет ТК. Смена водителя обновляет ТК (live, не snapshot).
- [ ] В шапке формы **нет поля «Статус»** — задаётся кнопками footer'а.
- [ ] Поле «Тара» в форме **отсутствует** как редактируемый input.
- [ ] В строке позиции отображается «Тара: —» для всех позиций (Phase 1).
- [ ] Суммарная панель пересчитывается live: Σ кг, число позиций, число поставщиков.
- [ ] Тара в суммаре отсутствует.
- [ ] Если хотя бы одна позиция имеет `kg <= 0` → inline error «Введите вес > 0»; save **заблокирован**.
- [ ] Если `shipDate > arrDate` → inline error «Дата поступления должна быть ≥ даты отгрузки»; save **заблокирован**.
- [ ] Если `arrDate` воскресенье → inline error; save заблокирован.
- [ ] После save — TableView показывает новую запись (observer).
- [ ] После save — PlanView факт ячейки увеличился на `kg/1000` тонн.

### 1.10 DriversRef (общее)

- [ ] Открыть `/references/drivers` → отображается таблица всех водителей.
- [ ] Поиск по ФИО фильтрует live (debounce 200мс).
- [ ] Поиск по телефону: ввод `9012345678` находит водителя с E.164 `+79012345678` (нормализация перед сравнением).
- [ ] Фильтр ТК работает.
- [ ] DriverModal по клику на ФИО:
  - [ ] ФИО, телефон (форматированный), ТК (name), доп.инфо корректны.
  - [ ] Кнопка «📋 копировать» работает (`navigator.clipboard.writeText(formatPhoneRu)`).
  - [ ] Кнопка «Открыть карточку ТК» — disabled.
  - [ ] Закрытие по ✕ и backdrop click.

### 1.11 Эстетика

- [ ] Caveat font загружен и отображается во всех Label.
- [ ] JetBrains Mono для чисел в позициях и ProgressBar.
- [ ] `.sk-box` рамки 2px чёрные с внутренней dashed (через `::before`).
- [ ] Фон страницы `#f0ede8`.
- [ ] Overlay-скроллбар появляется при scroll/hover.
- [ ] StatusChip цвета соответствуют [`DESIGN.md`](DESIGN.md#status-chip-palette).
- [ ] Plan cell цвета соответствуют [`DESIGN.md`](DESIGN.md#plan-cell-palette).
- [ ] RawPill цвета приходят из `RawMaterial.bg/dot` через `rawColor()` helper.

---

## 2. Admin checks

### 2.1 Sidebar (Admin)

- [ ] Видны все пункты sidebar: 📋 Отгрузки, 📦 Логистика (заглушка), 📄 Контракты (заглушка), 📊 Аналитика (заглушка), 🔔 Уведомления (заглушка), 📚 Справочники → Водители, остальные справочники (заглушки), ⚙ Настройки (заглушка).
- [ ] Клик по заглушке открывает `<StubPage>` «Раздел в работе (Phase N)».

### 2.2 TableView actions (Admin)

- [ ] Кнопка «+ Новая отгрузка» видна → открывает Form E пустую.
- [ ] Для статуса `sent`: action «✓ Отметить прибывшим» видим. Клик → confirm → `sent → arrived`, chip обновляется без рефреша.
- [ ] Для статуса `scheduled`: action «✓ Отметить прибывшим» **НЕ показывается** (запрет direct scheduled → arrived).
- [ ] Для статуса `scheduled` в edit-mode Form E: кнопка «Отправить» доступна → `scheduled → sent`.
- [ ] Для статуса `arrived`: action отметки отсутствует.
- [ ] Кнопка «🗑 Удалить» в строке видна для всех статусов; confirm dialog работает.
- [ ] Кнопка «✏ Редактировать» открывает Form E в edit-mode (full edit).

### 2.3 Form E (Admin, create)

- [ ] «Сохранить как запланировано» (валидное состояние) → `status='scheduled'`, модалка закрывается.
- [ ] «✓ Сохранить и отправить» → `status='sent'`.
- [ ] Создание из plan-cell: `rawId` и `arrDate` префилл; `arrDate` locked; первая позиция с `kg=0`; save заблокирован пока `kg <= 0`.
- [ ] Кнопка «+ Добавить позицию» создаёт новую строку.
- [ ] Удалить позицию ✕ работает; на последней — disabled.

### 2.4 Form E (Admin, edit)

- [ ] Status `scheduled`: доступны «Сохранить» (full edit), «Отправить» (→ sent), «Удалить».
- [ ] Status `sent`: доступны «Сохранить» (full edit), «Отметить прибывшим» (→ arrived), «Удалить».
- [ ] Status `arrived`: «Сохранить» влияет только на `comment`; остальные поля read-only; «Удалить» доступно.
- [ ] Обратный переход (например `sent → scheduled`) недоступен ни через одну кнопку.

### 2.5 PlanView (Admin)

- [ ] Input'ы плана editable. `onBlur` → save с debounce 300мс → re-render с новым % и цветом.
- [ ] Plan input принимает десятичные тонны (точка или запятая): `1.5`, `1,5`, `2,1`.
- [ ] Plan input нормализуется до шага 0.1 (введённое `1.234` → сохраняется `1.2`).
- [ ] Plan input блокирует негативные числа.
- [ ] Рефреш страницы → новое значение плана сохранилось.
- [ ] Empty state (W18 если `visibleRaws=[]`): «План не создан. Отметьте овощи для планирования через ⚙».
- [ ] ⚙ popover открывает плоский список 13 овощей, sorted by `sortOrder` ASC.
- [ ] Поставить чекбокс на любой овощ — успешно.
- [ ] Снять чекбокс с овоща без плана и без отгрузок — успешно.
- [ ] Снять чекбокс с защищённого овоща (plan > 0 OR отгрузки) → чекбокс не реагирует; tooltip «нельзя скрыть: есть план/отгрузки».
- [ ] Изменения `visibleRaws` сохраняются в `WeekPlan`; после рефреша состояние то же.

### 2.6 DriversRef (Admin)

- [ ] Кнопка «+ Новый водитель» видна → открывает DriverEditModal.
- [ ] Иконки ✏ и 🗑 в строке видны.
- [ ] Удаление водителя без shipments — успешно, водитель пропадает.
- [ ] Водитель с зависимостями — 🗑 disabled (`opacity: 0.3`, `cursor: not-allowed`), tooltip «Используется в N отгрузках».
- [ ] DriverEditModal:
  - [ ] Ввод `89012345678` → нормализуется к `+79012345678` (хранение), отображается `+7 (901) 234-56-78`.
  - [ ] Ввод `+7 901 234 56 78` — то же.
  - [ ] Ввод `12345` → ошибка валидации, save заблокирован.
  - [ ] ФИО короче 2 символов → ошибка.
  - [ ] ТК не выбран → ошибка.
  - [ ] Доп.инфо > 500 символов → ошибка.

---

## 3. Operator checks

> Переключиться в роль Operator через RoleToggle. Проверки:

### 3.1 Sidebar (Operator)

- [ ] Видны **только**: 📋 Отгрузки, 📚 Справочники → Водители.
- [ ] **НЕ видны**: Логистика, Контракты, Аналитика, Уведомления, остальные справочники, Настройки. (Не disabled, не opacity — **скрыто**.)
- [ ] **НЕ видна** заглушка Phase 2/3 разделов.

### 3.2 TableView (Operator)

- [ ] Просмотр всех режимов работает (Table, Heatmap, Plan).
- [ ] Кнопка «+ Новая отгрузка» **скрыта**.
- [ ] Action «✓ Отметить прибывшим»:
  - [ ] Для статуса `sent` — **видна**, кликабельна; клик → confirm → `sent → arrived`.
  - [ ] Для статуса `scheduled` — **скрыта**.
  - [ ] Для статуса `arrived` — отсутствует.
- [ ] Кнопка «🗑 Удалить» в строке **скрыта**.
- [ ] Кнопка «✏ Редактировать» **видна** → открывает Form E в restricted mode.

### 3.3 Form E restricted (Operator, edit)

- [ ] Все поля шапки **read-only**: shipDate, arrDate, driver, tk.
- [ ] Все поля позиций **read-only**: rawId, kg, supplierId.
- [ ] Add/remove `ShipmentItem` ✕ кнопки disabled или скрыты.
- [ ] Поле `comment` **editable**.
- [ ] «Сохранить» сохраняет **только** `comment`; никаких других изменений.
- [ ] Status `scheduled`: status-actions **скрыты** (Operator не может `scheduled → sent`).
- [ ] Status `sent`: «Отметить прибывшим» **видна** → `sent → arrived`.
- [ ] Status `arrived`: status-actions отсутствуют (как у Admin).
- [ ] «Удалить» **скрыта** во всех статусах.

### 3.4 PlanView (Operator)

- [ ] Plan input'ы **read-only**.
- [ ] ⚙ кнопка **скрыта**.
- [ ] Empty state: «План не создан. Обратитесь к администратору для настройки овощей недели».
- [ ] Клик по plan-cell **не открывает** Form E (Plan view только просмотр для Operator).

### 3.5 DriversRef (Operator)

- [ ] Таблица водителей видна.
- [ ] Поиск и фильтры работают.
- [ ] Кнопка «+ Новый водитель» **скрыта**.
- [ ] Иконки ✏ и 🗑 в строке **скрыты**.
- [ ] DriverModal открывается по клику на ФИО; кнопка «Редактировать водителя» в модалке **скрыта**.

---

## 4. User checks

> Переключиться в роль User через RoleToggle. Проверки:

### 4.1 Sidebar (User)

- [ ] Видны **только**: 📋 Отгрузки, 📚 Справочники → Водители.
- [ ] Остальные разделы **скрыты** (так же как у Operator).

### 4.2 TableView (User)

- [ ] Просмотр всех режимов работает.
- [ ] Кнопка «+ Новая отгрузка» **скрыта**.
- [ ] Action «✓ Отметить прибывшим» **скрыт** для всех статусов.
- [ ] Кнопка «🗑 Удалить» в строке **скрыта**.
- [ ] Кнопка «✏ Редактировать» **скрыта** (User не входит в edit-mode).

### 4.3 Form E (User)

- [ ] Не открывается — нет инициирующего action в UI.
- [ ] Если попытаться открыть напрямую через состояние/URL (force) — модалка либо не открывается, либо в полностью read-only состоянии без кнопок save (защита от обхода UI).

### 4.4 PlanView (User)

- [ ] Plan input'ы **read-only**.
- [ ] ⚙ кнопка **скрыта**.
- [ ] Empty state: «План не создан. Обратитесь к администратору для настройки овощей недели».
- [ ] Клик по plan-cell **не открывает** Form E.

### 4.5 DriversRef (User)

- [ ] Таблица водителей видна.
- [ ] Поиск и фильтры работают.
- [ ] Кнопка «+ Новый водитель» **скрыта**.
- [ ] Иконки ✏ и 🗑 в строке **скрыты**.
- [ ] DriverModal открывается; кнопка «Редактировать водителя» **скрыта**.

---

## 5. Tests (unit, Vitest)

`npm run test` запускает Vitest. Покрытие:

### `src/lib/__tests__/`

- [ ] `cell-state.test.ts` — все 6 состояний `getCellState(planTons, factTons)`, граничные значения 0, 79, 80, 99, 100, 120, 121.
- [ ] `validation.test.ts`:
  - [ ] `validateShipment`: валидный; пустые items; `kg=0`; отсутствие `driverId`; `arrDate < shipDate`; **`arrDate` воскресенье**.
  - [ ] `validateDriver`: короткое `fio`; невалидный `phone`; отсутствие `tkId`; длинный `info`.
  - [ ] `validatePlanInput`: negative; NaN; step 0.1 нормализация.
- [ ] `units.test.ts`:
  - [ ] `parseTonsInput`: `'1,5'` → `1.5`; `'1.5'` → `1.5`; `''` → `null`; `'abc'` → `null`.
  - [ ] `formatTons`: ru-RU `1.5` → `'1,5'`.
  - [ ] `kgToTons(18000)` → `18`; `tonsToKg(1.5)` → `1500`.
  - [ ] `roundToStep(1.234, 0.1)` → `1.2`.
- [ ] `date.test.ts`:
  - [ ] `parseLocalDate('2025-04-21')` — без UTC shift, локальный midnight.
  - [ ] `isoWeek` edge cases (W1, W53, year-cross).
  - [ ] `isSunday('2025-04-27')` → true; `isSunday('2025-04-21')` → false.
- [ ] `week-utils.test.ts` — формат `«21–26 апр 2025»`; month-cross weeks.
- [ ] `phone.test.ts`:
  - [ ] `normalizePhoneRu`: `'89012345678'`, `'+7 901 234 56 78'`, `'79012345678'`, `'9012345678'` → `'+79012345678'`; `'12345'` → `null`.
  - [ ] `formatPhoneRu('+79012345678')` → `'+7 (901) 234-56-78'`.

### `src/services/__tests__/`

- [ ] `permissions.test.ts` — все `canXxx(...)` × 3 active роли (admin/operator/user); director возвращает false для всего.
- [ ] `shipmentStatus.test.ts`:
  - [ ] `canTransitionShipmentStatus('admin', 'scheduled', 'sent')` → true.
  - [ ] `canTransitionShipmentStatus('admin', 'sent', 'arrived')` → true.
  - [ ] `canTransitionShipmentStatus('admin', 'scheduled', 'arrived')` → **false**.
  - [ ] `canTransitionShipmentStatus('operator', 'scheduled', 'sent')` → false.
  - [ ] `canTransitionShipmentStatus('operator', 'sent', 'arrived')` → true.
  - [ ] Все обратные переходы → false (любая роль).
- [ ] `planRules.test.ts` — `canDeleteVisibleRaw` true/false sceneries.

---

## 6. Dev tools

- [ ] Кнопка «⟲ reset to seeds» видна внизу sidebar **только в DEV mode** (`import.meta.env.DEV === true`).
- [ ] В production build (`npm run build && npm run preview`) кнопка отсутствует.
- [ ] Клик по кнопке → confirm → очищает все `wsm:v1:*` ключи → запускает re-seed → перезагружает страницу.

---

**Seed scenarios coverage**: все сценарии S1–S12 из [`IMPLEMENTATION.md#seed-strategy`](IMPLEMENTATION.md#seed-strategy) должны быть видимы при ручной проверке выше.

— конец ACCEPTANCE.md —
