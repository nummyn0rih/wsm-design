# CLAUDE.md — WSM Repository Rules

> Эти правила обязательны для любого Claude Code сеанса в этом репозитории.

## Sources of truth

- Product spec: [`docs/PRD.md`](docs/PRD.md)
- Domain & business rules: [`docs/DOMAIN.md`](docs/DOMAIN.md)
- Architecture & implementation: [`docs/IMPLEMENTATION.md`](docs/IMPLEMENTATION.md)
- Visual rules: [`docs/DESIGN.md`](docs/DESIGN.md)
- Acceptance checklist: [`docs/ACCEPTANCE.md`](docs/ACCEPTANCE.md)
- Implementation backlog: [`docs/TASKS.md`](docs/TASKS.md)
- Reference bundle (frozen, read-only): [`reference/`](reference/)
- Audit history: [`docs/audit/`](docs/audit/)
- Legacy snapshots: [`docs/legacy/`](docs/legacy/)

## Work process

- **PRD-first**: не одной строки кода приложения, пока продуктовая/доменная документация не утверждена пользователем.
- **Plan before code**: любая нетривиальная задача начинается с плана и явного approval.
- **One task at a time**: без расползания scope. Если задача требует расширения — спросить, не делать.
- **Doc parity**: при изменении доменной модели или архитектуры обновлять соответствующий документ в том же коммите.
- **Run checks before reporting done**: typecheck, lint, vitest — если доступны в окружении.

## Scope control (Phase 1)

- Активные роли Phase 1: `admin`, `operator`, `user`. `director` зарезервирован в типе, но в UI не активен.
- Реализуемые экраны: главная (Table/Heatmap/Plan), DriverModal, Form E, DriversRef.
- Любая Phase 2/3 функциональность реализуется только по явному запросу.
- Никаких новых dependencies без approval.
- `reference/` — frozen reference bundle, **не трогать**.

## Domain conventions

- IDs — английский kebab/snake (`raw_cucumbers`, `tara_veg_box`, `drv_xxx`).
- Enum значения — английские строки (`'scheduled' | 'sent' | 'arrived'`).
- Русский текст — только в `*_LABELS` константах.
- Phone storage: E.164 (`+7XXXXXXXXXX`); UI форматирует через `formatPhoneRu`.
- Dates — ISO date strings `YYYY-MM-DD`, обрабатываются как plain local dates; никаких UTC-конверсий.
- Working week = Mon–Sat. Sunday `arrDate` блокируется валидацией.
- Units: `ShipmentItem.kg` — кг (integer > 0); `WeekPlan.plan[r][d]` — тонны (number, step 0.1).
- `factTons = sumKg / 1000`.

## Architecture conventions

- **Repos** (`src/repos/`) — persistence + observer; `CrudRepo<T, Q>` — Phase 1 внутренний контракт.
- **Services** (`src/services/`) — бизнес-правила, permissions, status transitions, plan rules, date rules, validation. Не размазывать бизнес-логику по React-компонентам.
- **Hooks** — тонкие обёртки над services и repo subscriptions.
- **RoleGate** — UI guard, не security boundary. Реальный enforcement permissions — backend Phase 3. В Phase 3 возможен `PermissionGate` (permission-based вместо role-based).
- **LocalStorageRepo** — Phase 1 only. Бесшовная замена на API не гарантируется (потребуется query/cache layer).

## Forbidden in Phase 1

- Прямой переход status `scheduled → arrived` (запрещён). Только `scheduled → sent → arrived`.
- Обратные переходы статусов.
- Редактирование `Shipment` Operator'ом, кроме `comment`.
- Архив-блок на TableView/edit/delete — archive касается **только** `WeekPlan` и Plan view.
- Sunday `arrDate`.
- Period dropdown в TableView (Phase 2).

## Out of scope

См. [`docs/TASKS.md`](docs/TASKS.md) → Phase 2/3 backlog.
