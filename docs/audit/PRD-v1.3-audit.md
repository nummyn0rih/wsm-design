# PRD v1.3 Audit — Documentation Split + Domain Decisions

> Контекст: PRD.md v1.2 (1394 строки) перерос свой жанр — смешаны продуктовые требования, домен, архитектура, дизайн, acceptance и future roadmap. Пользователь принял 18 продуктово-архитектурных решений для v1.3. Цель: контролируемое разделение на 7 документов И одновременное применение v1.3 решений в правильные целевые документы.
>
> Этот файл — артефакт принятия решений. Используется как аудиторский след; правит командой review, но не служит источником правды (источник — `docs/PRD.md`, `docs/DOMAIN.md` и т.д.).

---

## A. Files Created

| Path | Purpose | Approx size |
|---|---|---|
| `docs/PRD.md` | Продуктовый источник правды: контекст, цели, роли (high-level), Phase 1 scope, core flows, out of scope | ~250 строк |
| `docs/DOMAIN.md` | Domain + business rules: glossary, типы, enum, labels, инварианты, status transitions, archive rules, units, dates, phone, weekly vs contract plan, visibleRaws protection, tara rules, validation | ~500 строк |
| `docs/IMPLEMENTATION.md` | Технический источник правды: stack, repo pattern, LocalStorage limitations, service/domain layer, state mgmt, ShipmentsPage URL state, folder structure, seed strategy, testing, future API notes | ~400 строк |
| `docs/DESIGN.md` | Визуальные правила: reference bundle map, sketch-style, fonts, colors, RawMaterial visual rules, StatusChip, Plan cell visual table, ProgressBar specs, scrollbar, UI placeholder rules, a11y baseline | ~200 строк |
| `docs/ACCEPTANCE.md` | Verification checklist: три раздела per-role (Admin / Operator / User) + общие | ~250 строк |
| `docs/TASKS.md` | Phased implementation backlog с чек-листом задач, Phase 2/3 backlog | ~200 строк |
| `CLAUDE.md` | Правила Claude Code в репозитории — в корне | ~80 строк |
| `docs/legacy/PRD-v1.2.md` | Snapshot предыдущей версии (через `git mv`) | 1394 строки |

---

## B. Section Mapping: PRD.md v1.2 → target files

«KEEP» = остаётся в новом `docs/PRD.md`, «MOVE» = переносится в указанный документ, «REWRITE» = переписывается под v1.3 решения, «DROP» = удаляется (устарело или избыточно).

| Current section | Action | Target | Notes |
|---|---|---|---|
| Заголовок v1.2 + changelog | REWRITE | `docs/PRD.md` | Новый changelog v1.3 |
| §1.1 Продукт | KEEP + REWRITE | `docs/PRD.md` | Модель данных не различает «основные/сезонные» |
| §1.2 Бизнес-задача | KEEP | `docs/PRD.md` | |
| §1.3 Пользователи | REWRITE | `docs/PRD.md` | 4 роли (admin/operator/user/director); описание Operator detailed |
| §1.4 Скоуп MVP | KEEP | `docs/PRD.md` | |
| §1.5 НЕ в скоупе | MOVE | `docs/TASKS.md` | Краткая выжимка остаётся в PRD как ссылка |
| §1.6 Roadmap | MOVE | `docs/TASKS.md` | Короткое summary в PRD |
| §2 Глоссарий | MOVE | `docs/DOMAIN.md` | + TaraType seed Phase 1 уточнение |
| §3.1 Sidebar matrix | REWRITE + MOVE | `docs/PRD.md` + `docs/DOMAIN.md` | 4 роли |
| §3.2 Действия matrix | REWRITE + MOVE | `docs/DOMAIN.md` | Operator comment-only |
| §3.3 RoleGate | MOVE | `docs/IMPLEMENTATION.md` | + Permission helpers list |
| §4.1 Таблица | REWRITE + KEEP | `docs/PRD.md` | Без Period dropdown; per-role visibility; archive ≠ block edit |
| §4.2 Heatmap | KEEP + REWRITE | `docs/PRD.md` | Кнопки disabled + tooltip Phase 2; week selector из page state |
| §4.3 План | REWRITE | `docs/PRD.md` + `docs/DOMAIN.md` | tons step 0.1; empty state per-role; archive scope clarified |
| §4.3.5 Cell color logic | MOVE | `docs/DOMAIN.md` (логика) + `docs/DESIGN.md` (visual table) | |
| §4.4 DriverModal | KEEP | `docs/PRD.md` | |
| §4.5 Form E | REWRITE | `docs/PRD.md` | Save-block kg=0 / shipDate>arrDate inline; arrived edit per-role; restricted mode Operator |
| §4.5.8 Edit mode | REWRITE + MOVE | `docs/DOMAIN.md` | Полная таблица status × role × allowed actions |
| §4.6 DriversRef | KEEP | `docs/PRD.md` | |
| §5.1 Принципы | MOVE | `docs/DOMAIN.md` | |
| §5.2 TypeScript types | MOVE | `docs/DOMAIN.md` | + Role 4-value, ROLE_LABELS, комментарии единиц |
| §5.3 Инварианты | MOVE + UPDATE | `docs/DOMAIN.md` | I9 переписать (archive scope), I12 strict A; новые I21+ |
| §6.1 Статусы | REWRITE + MOVE | `docs/DOMAIN.md` | Strict Variant A |
| §6.2 Что считается фактом | MOVE | `docs/DOMAIN.md` | |
| §6.3 Cell color logic | DROP (дубль §4.3.5) | — | Ссылка в DOMAIN |
| §6.4 Visibility protection | MOVE | `docs/DOMAIN.md` | |
| §6.5 Archive week | REWRITE + MOVE | `docs/DOMAIN.md` | Archive scope = WeekPlan only |
| §6.6 Default status | MOVE | `docs/DOMAIN.md` | |
| §6.7 Расчёт arrDate | MOVE | `docs/DOMAIN.md` | + Sunday-block правило |
| §6.8 ТК autofill | MOVE | `docs/DOMAIN.md` | |
| §6.9 Удаление с FK | MOVE | `docs/DOMAIN.md` | |
| §6.10 Валидация | MOVE | `docs/DOMAIN.md` | + new rules (tons step, kg>0 inline, Sunday) |
| §6.11 Phone | MOVE | `docs/DOMAIN.md` | |
| §6.12 Tara autogen Phase 2 | MOVE | `docs/DOMAIN.md` | Чётко разделить Phase 1 ([]) vs Phase 2 (editable count) |
| §6.13 Global order sortOrder | MOVE | `docs/DOMAIN.md` | |
| §7.1 Стек | MOVE | `docs/IMPLEMENTATION.md` | |
| §7.2 Storage | REWRITE + MOVE | `docs/IMPLEMENTATION.md` | LocalStorage Phase 1 only |
| §7.3 i18n | MOVE | `docs/IMPLEMENTATION.md` | |
| §7.4 Браузеры | MOVE | `docs/IMPLEMENTATION.md` | |
| §7.5 Эстетика | MOVE | `docs/DESIGN.md` | |
| §7.6 Производительность | MOVE | `docs/IMPLEMENTATION.md` | |
| §7.7 a11y | MOVE | `docs/DESIGN.md` (baseline) | |
| §8.1 Repository pattern | MOVE | `docs/IMPLEMENTATION.md` | + note: CrudRepo внутренний контракт |
| §8.2 LocalStorageRepo | MOVE | `docs/IMPLEMENTATION.md` | |
| §8.3 Observer | MOVE | `docs/IMPLEMENTATION.md` | |
| §8.4 DI Context | MOVE | `docs/IMPLEMENTATION.md` | |
| §8.5 RoleGate impl | MOVE | `docs/IMPLEMENTATION.md` | + Future PermissionGate note |
| §8.6 Folder structure | MOVE + UPDATE | `docs/IMPLEMENTATION.md` | + `src/services/`, `taraTypes.seed.ts`, `TaraTypeRepo` |
| §9 Открытые вопросы (закрыты) | DROP | — | История в git |
| §10.1 Out of scope разделы | MOVE | `docs/TASKS.md` (Phase 2/3 backlog) | |
| §10.2 Точечные функции | MOVE | `docs/TASKS.md` | |
| §11 Verification checklist | MOVE + REWRITE | `docs/ACCEPTANCE.md` | Под v1.3 решения, per-role |
| Приложение A Источники | MOVE | `docs/DESIGN.md` | reference bundle map |
| Приложение B Зафиксированные правила | MOVE + UPDATE | `docs/DOMAIN.md` | F8 (Variant A), F15-F17 новые |

---

## C. v1.3 Decisions Applied

| # | Decision | Target document(s) |
|---|---|---|
| 1 | Roles (admin/operator/user/director, Phase 1 active = 3) | DOMAIN (permission matrix), PRD (high-level roles), IMPLEMENTATION (Role type, RoleToggle limit) |
| 2 | Status transitions Variant A | DOMAIN, PRD (UI rules), ACCEPTANCE |
| 3 | Archive scope = WeekPlan only | DOMAIN (archive, I9), PRD (Plan view), ACCEPTANCE |
| 4 | ShipmentsPage state + URL | IMPLEMENTATION (state model), PRD (URL overview), ACCEPTANCE |
| 5 | Dates + Mon-Sat + Sunday-block | DOMAIN (dates, validation), ACCEPTANCE |
| 6 | Units (kg integer, tons number step 0.1) | DOMAIN, IMPLEMENTATION (helpers) |
| 7 | Weekly vs contract plan | DOMAIN (Plans hierarchy), PRD |
| 8 | LocalStorageRepo Phase 1 only | IMPLEMENTATION |
| 9 | Service/domain layer | IMPLEMENTATION, DOMAIN |
| 10 | RawMaterial colors single source | DOMAIN (bg/dot), DESIGN (palette), IMPLEMENTATION (helper) |
| 11 | TaraType seed Phase 1 + read-only repo | DOMAIN (FK consistency), IMPLEMENTATION |
| 12 | TransportCompany.name only | DOMAIN, PRD |
| 13 | UI placeholders policy | PRD, DESIGN |
| 14 | Plan empty state per-role | PRD, ACCEPTANCE |
| 15 | Form E save-block kg=0 / shipDate>arrDate | PRD, DOMAIN, ACCEPTANCE |
| 16 | Edit mode arrived per-role | PRD, DOMAIN |
| 17 | Seed scenarios | IMPLEMENTATION, ACCEPTANCE |
| 18 | Future PermissionGate Phase 3 | IMPLEMENTATION |

---

## D. Locked Decisions (Q&A complete)

| # | Question | Resolution |
|---|---|---|
| Q1 | Docs location | **Hybrid**: `CLAUDE.md` в корне, остальные 6 документов в `docs/`. |
| Q2 | Старый `PRD.md` | **Snapshot**: `git mv PRD.md docs/legacy/PRD-v1.2.md`. |
| Q3 | §9 «Открытые вопросы» | **Удалить** — история в git. |
| Q4 | Audit save | **Сохранить** в `docs/audit/PRD-v1.3-audit.md` (этот файл). |
| Q5 | Operator UI | **Form E restricted mode**: одна модалка, все поля read-only кроме `comment`. |
| Q6 | Director role | **Резерв в типе**: `Role = 'admin' | 'operator' | 'user' | 'director'`. `ROLE_LABELS` все 4. `RoleToggle` Phase 1 рендерит только 3 активные. |
| Q7 | SEED_SCENARIOS | **Раздел в `docs/IMPLEMENTATION.md`** (Seed strategy). |
| Q8 | ACCEPTANCE структура | **Три раздела per-role** (Admin / Operator / User) + общие. |
| Q9 | TASKS формат | **Линейный markdown checklist** по фазам Phase 1 + Phase 2/3 backlog отдельным разделом. |
| Q10 | Commit strategy | **Два коммита**: 1) docs structure + CLAUDE.md + audit; 2) legacy snapshot. |

---

## E. v1.3 Changelog (для шапки docs/PRD.md)

```
PRD v1.3 (split into multi-doc)

Documentation structure:
- docs/PRD.md (this file): product source of truth.
- docs/DOMAIN.md: entities, enums, invariants, business rules.
- docs/IMPLEMENTATION.md: stack, architecture, repos, services, folder structure.
- docs/DESIGN.md: visual rules, reference bundle map.
- docs/ACCEPTANCE.md: verification checklist.
- docs/TASKS.md: phased implementation backlog.
- CLAUDE.md: Claude Code rules in this repo.

Roles & permissions (was 2 roles, now 4):
- Role = 'admin' | 'operator' | 'user' | 'director'.
- Phase 1 active: admin, operator, user. Director reserved for Phase 3+, not in RoleToggle.
- Operator: working role for shipments + drivers view only.
  - Can transition sent → arrived only.
  - Can edit Shipment.comment only.
  - Cannot create/delete shipments, cannot edit core fields, cannot CRUD drivers, cannot edit WeekPlan.
- User: strict read-only.
- Sidebar non-admin: invisible items, not disabled/opacity.

Status transitions (strict Variant A):
- Allowed: scheduled → sent, sent → arrived.
- Forbidden: scheduled → arrived direct, all reverse transitions.
- TableView mark-arrived action: only for status=sent.
- scheduled → sent: admin only.
- sent → arrived: admin + operator.

Archive scope (clarified):
- WeekPlan.archive=true blocks ONLY Plan view editing + PlanRepo.save.
- TableView, Form E edit/delete, status transitions, mark-arrived — independent of archive.

Plan precision:
- Plan input: tons, number, step 0.1 (was integer).
- Helpers: kgToTons, tonsToKg, parseTonsInput, formatTons.

ShipmentsPage state & URL:
- {view, weekNum, year} synced to URL.
- View switch preserves week/year.
- TableView expanded/collapsed: useState only Phase 1 (no LS persist).

Dates & working week:
- ISO date strings YYYY-MM-DD treated as plain local dates.
- Working week = Mon–Sat. Sunday arrDate forbidden by validation.

Units:
- ShipmentItem.kg = kg (integer > 0).
- WeekPlan.plan[r][d] = tons (number, step 0.1).
- factTons = sumKg / 1000.

Tara (Phase 1 vs Phase 2):
- Phase 1: ShipmentItem.tara = [] always, display-only "—".
- Phase 2: autogen via TaraLoadNorm, editable count, fixed type.
- TaraType seed in Phase 1 for FK consistency; UI/CRUD Phase 2.

RawMaterial colors:
- Single source: bg/dot fields in RawMaterial seed.
- raw-colors.ts is a helper, not a duplicate source.

UI placeholders:
- TableView Period dropdown removed from Phase 1.
- Heatmap "Среднее", "% от плана" disabled + tooltip "Phase 2".

Architecture:
- Service/domain layer (src/services/): permissions, status transitions, plan rules, date rules.
- CrudRepo: Phase 1 internal contract, not backend API contract.
- Future PermissionGate (Phase 3) note added.

Form E:
- Save blocked until every item kg > 0 (inline validation).
- Save blocked if shipDate > arrDate (inline error).
- Edit arrived: per-role table, comment editable for admin+operator, all other fields read-only.

Seed:
- Scenario-based (documented in IMPLEMENTATION.md Seed strategy).
- No Sunday arrDate.

Domain note:
- Weekly plan ≠ contract plan. Weekly is operational demand by raw; contract is seasonal supplier obligation. WeekPlan is not auto-derived from Contract in Phase 1.

Removed:
- §9 "Открытые вопросы" — history in git.
- Period dropdown UI.
- All references to scheduled → arrived direct transition.
- All references to archive blocking shipment edits.
```

---

## F. Commit Strategy Applied

- **Commit 1** (`docs(prd): v1.3 split into PRD/DOMAIN/IMPLEMENTATION/DESIGN/ACCEPTANCE/TASKS + CLAUDE.md`):
  - `docs/audit/PRD-v1.3-audit.md` (этот файл)
  - `docs/PRD.md`, `docs/DOMAIN.md`, `docs/IMPLEMENTATION.md`, `docs/DESIGN.md`, `docs/ACCEPTANCE.md`, `docs/TASKS.md`
  - `CLAUDE.md`
- **Commit 2** (`docs(prd): archive PRD v1.2 as legacy snapshot`):
  - `git mv PRD.md docs/legacy/PRD-v1.2.md`

---

## G. Final State

```
/home/nummyn0rih/projects/wsm-design/
  CLAUDE.md
  .gitignore
  reference/                      (unchanged, frozen)
  docs/
    PRD.md                        v1.3 product spec
    DOMAIN.md                     entities, invariants, rules
    IMPLEMENTATION.md             stack, repos, services
    DESIGN.md                     visual rules
    ACCEPTANCE.md                 per-role checklist
    TASKS.md                      phased backlog
    audit/
      PRD-v1.3-audit.md           (this file)
    legacy/
      PRD-v1.2.md                 snapshot
```
