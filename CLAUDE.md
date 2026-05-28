# CLAUDE.md — WSM Repository Rules

> Operational guide для будущих Claude Code сессий в этом репозитории. Не дублирует PRD — навигация + поведенческие правила.

## Sources of truth (order)

Если документы конфликтуют — **остановись и запроси уточнение**, не выбирай молча.

1. [`docs/PRD.md`](docs/PRD.md) — product scope, phase boundaries, user flows.
2. [`docs/DOMAIN.md`](docs/DOMAIN.md) — domain model, статусы, роли, permissions, validation, инварианты.
3. [`docs/IMPLEMENTATION.md`](docs/IMPLEMENTATION.md) — architecture, folder structure, repo/service patterns.
4. [`docs/DESIGN.md`](docs/DESIGN.md) — visual rules, палитры, UI behavior, accessibility baseline.
5. [`docs/ACCEPTANCE.md`](docs/ACCEPTANCE.md) — done criteria, manual + automated checks.
6. [`docs/TASKS.md`](docs/TASKS.md) — implementation order, Phase 1 milestones, Phase 2/3 backlog.

Reference / archive:
- [`reference/`](reference/) — frozen design bundle (read-only, не редактировать).
- [`docs/audit/`](docs/audit/) — audit artifacts.
- [`docs/legacy/`](docs/legacy/) — snapshots прошлых версий.

## Work process

- **PRD-first**: ни одной строки кода приложения, пока продуктовая/доменная документация не утверждена пользователем.
- **Plan before code**: любая нетривиальная задача начинается с плана и явного approval.
- **One task at a time**: без расползания scope. Расширение требует — спросить, не делать.
- **Doc parity**: при изменении доменной модели или архитектуры обновлять весь связанный комплект документов (см. правило 14 ниже).
- **Run checks before reporting done**: typecheck, lint, vitest — если доступны.

## Operational rules

### 1. Phase discipline

- Phase 2/3 не реализуется без отдельного approval.
- Phase 2/3 reference files — визуальный/продуктовый ориентир, не scope.
- Элементы Phase 2/3 в UI Phase 1: либо hidden, либо `disabled` + tooltip + `aria-disabled`, либо `<StubPage>` для sidebar.

### 2. No silent scope expansion

Запрещено добавлять без approval: новые поля, фильтры, статусы, роли, страницы, API, persistence backend, auth, мобильный UI, аналитику, уведомления, печать. Если кажется, что чего-то не хватает — создай вопрос/assumption, не кодь расширение.

### 3. Roles & permissions

- Phase 1 active: `admin`, `operator`, `user` (read-only).
- `director` зарезервирован в типе `Role` + `ROLE_LABELS`, но **не активен** в RoleToggle. Никаких director-specific behavior в Phase 1 acceptance/tasks.
- Все UI actions проверяются через permission helpers (`src/services/permissions.ts`), не только скрываются в UI.

### 4. Status transitions

- Разрешено: `scheduled → sent`, `sent → arrived`. Только через documented service (`shipmentStatus.ts`).
- **Запрещено**: direct `scheduled → arrived`, любые обратные. Не должно появляться ни в UI, ни в service.
- Operator выполняет `sent → arrived` через TableView action — **не** через restricted Form E (там status-actions отсутствуют).
- `arrived` shipment: core/items read-only; `comment` editable для admin/operator.

### 5. Data / unit discipline

- `ShipmentItem.kg` — только кг (integer > 0).
- `WeekPlan.plan[r][d]` — только тонны (number, step 0.1).
- Сравнения план/факт — после явного conversion (`factTons = kgToTons(sumKg)`).
- Запрещено смешивать kg и tons в одной переменной без явного имени.

### 6. Seed discipline

- Seed создаёт 3 недели **relative to `currentWeekId()`**: previous (archive=true), current, next.
- W16/W17/W18 2025 — **только пример**, не обязательные labels.
- Seed order для FK dependencies: TaraTypes → Raws/TKs/Suppliers → Drivers → Shipments → Plans.
- Archive restrictions не блокируют initial seed (seed layer обходит `PlanRepo.save` archive check).
- **No Sunday `arrDate`** во всём seed.

### 7. Archive semantics

- `WeekPlan.archive=true` блокирует только Plan view editing и runtime `PlanRepo.save`.
- TableView, Form E edit/delete, status transitions для Shipment в архивной неделе — работают свободно.
- Никаких других «archive» интерпретаций.

### 8. Repository / service discipline

- UI не мутирует repositories напрямую, если есть service для операции.
- Business rules — в `src/services/` и `src/lib/`, не в React-компонентах.
- `LocalStorageRepo` / in-memory — Phase 1 implementation detail, **не** финальный backend contract.
- Не создавать generic backend abstraction сверх описанного в IMPLEMENTATION.md.

### 9. React state discipline

- `useSyncExternalStore` `getSnapshot` **не возвращает** новый array/object reference на каждый вызов — иначе бесконечный rerender.
- Phase 1 pattern: repo возвращает stable full snapshot; hooks фильтруют/сортируют через `useMemo`.
- Другая схема — сначала обновить IMPLEMENTATION.md и получить approval.

### 10. Reference bundle

- `reference/` — frozen, не редактировать.
- Не копировать prototype JSX one-to-one в production. Это прототипы, не production-ready.
- Использовать reference как визуальный/поведенческий ориентир.

### 11. Styling

- Без сторонних CSS frameworks.
- Sketch visual system — через `tokens.css` и `sketch.css`.
- Цвета не hardcode в компонентах, кроме явно задокументированных fallback.
- RawMaterial colors — только из seed fields `bg`/`dot` через helper. Никакого дубликата `RAW_COLORS` map.

### 12. Accessibility baseline

- `<button>`/`<input>`/`<select>`/`<textarea>` или семантические элементы — не `<div onClick>`.
- Icon-only buttons требуют `aria-label`.
- Disabled placeholders — `disabled` или `aria-disabled="true"` + tooltip.
- Focus-visible сохраняется.
- Modal — focus trap Phase 1 минимум.

### 13. Routing

- `createBrowserRouter` + `<RouterProvider>` (не `<BrowserRouter>` JSX wrapper).
- URL state для TableView — согласно [`IMPLEMENTATION.md#9-shipmentspage-state-model`](docs/IMPLEMENTATION.md#9-shipmentspage-state-model): view/week/year.
- Unknown routes → `<StubPage>` «Раздел в работе».
- Не добавлять routes сверх Phase 1.

### 14. Documentation parity

При изменении domain/permission/status behavior — обновлять весь связанный комплект:
- PRD.md (если меняется product scope);
- DOMAIN.md (правила/типы);
- IMPLEMENTATION.md (архитектура/helpers);
- DESIGN.md (UI behavior);
- ACCEPTANCE.md (checks);
- TASKS.md (последовательность);
- CLAUDE.md (guardrails).

Не оставлять документы inconsistent.

### 15. Ask-before-changing critical decisions

Остановись и спроси approval перед изменением:
- roles / permissions;
- status transitions;
- archive semantics;
- units (kg/tons);
- seed scenario shape;
- структура файлов docs/;
- Phase 1 scope;
- storage / persistence approach;
- router approach;
- design palette / reference-derived visuals.

### 16. Commit discipline

- Следуй выбранной commit strategy (см. план задачи).
- Не смешивать documentation patch и application implementation в одном коммите.
- Для documentation patch не создавать `src/`, `package.json`, Vite/TS config или runtime код.
- После patch — вывести changed files и summary.

### 17. Validation before final response

Перед финальным ответом по documentation patch выполнить grep/checklist:
- нет обязательных W16/W17/W18 current labels;
- нет разрешения direct `scheduled → arrived`;
- нет абсолютного пути `/home/...`;
- relative links внутри `docs/` корректны;
- `docs/PRD.md` ссылается на `legacy/PRD-v1.2.md` (не `docs/legacy/...`);
- CLAUDE.md не противоречит остальной документации.

---

## Out of scope (Phase 1)

См. [`docs/TASKS.md`](docs/TASKS.md#phase-2--бизнес-разделы).

---

## When in doubt

1. **Stop**.
2. Identify conflicting docs / rules.
3. Ask for approval.
4. **Do not silently expand scope.**
