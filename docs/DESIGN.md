# WSM — Visual Design Rules

> Визуальные правила Phase 1: sketch-style, fonts, colors, palettes, ProgressBar, scrollbar, UI placeholder rules, a11y baseline + reference bundle map.

## Contents

1. [Sketch aesthetic](#1-sketch-aesthetic)
2. [Fonts](#2-fonts)
3. [Palettes](#3-palettes)
4. [Plan cell palette](#plan-cell-palette)
5. [Status chip palette](#status-chip-palette)
6. [Raw material palette](#raw-material-palette)
7. [ProgressBar specs](#4-progressbar-specs)
8. [Scrollbar](#5-scrollbar)
9. [Date inputs](#6-date-inputs)
10. [UI placeholder rules](#7-ui-placeholder-rules)
11. [Accessibility baseline](#8-accessibility-baseline)
12. [Reference bundle map](#reference-bundle-map)

---

## 1. Sketch aesthetic

- **2px чёрные рамки** через `.sk-box`.
- **Вложенная dashed-рамка** через `::before` псевдоэлемент.
- **Фон бумаги**: `#f0ede8`.
- **Рукописный шрифт** — Caveat для заголовков и подписей.
- Цвет основного текста: `#2a2a2a` (`--ink`).

Все sketch-стили — в `src/styles/sketch.css`. CSS-переменные — в `src/styles/tokens.css`.

---

## 2. Fonts

| Шрифт | Применение | Источник |
|---|---|---|
| **Caveat** | Заголовки, labels, sketch-декоративный текст | Google Fonts |
| **JetBrains Mono** | Табличные числа, плотные данные (вес кг, прогресс %, ProgressBar tooltips, ItemLine kg) | Google Fonts |

Правило: **Caveat** для всех декоративных/handwritten контекстов (заголовки секций, sidebar labels, pills, status chips, plan cell labels). **JetBrains Mono** для всего, что читается как табличные данные (цифры веса, проценты, даты в моноспейс-выравнивании).

Подключение в `index.html` через `<link rel="preconnect">` + `<link rel="stylesheet">`. **Без сторонних CSS-фреймворков**.

> Если reference требует Caveat в плотных данных и читаемость страдает — это intentional reference-matching decision. Любое отклонение от reference (например, замена Caveat на JetBrains Mono в табличных колонках) — отдельный change request, не silent decision.

---

## 3. Palettes

Все цвета — в `src/styles/tokens.css` как CSS-переменные. UI-компоненты используют переменные, не hardcoded hex.

### Brand tokens

| Token | Hex | Применение |
|---|---|---|
| `--bg` | `#f0ede8` | Фон страницы |
| `--ink` | `#2a2a2a` | Основной текст |
| `--ink-muted` | `#666` | Вспомогательный текст |
| `--border` | `#2a2a2a` | Рамки sketch |
| `--border-soft` | `#d8d4c8` | Soft borders |

---

## Plan cell palette

_Источник: `reference/project/plan-view.jsx` L166–192. **Не редизайнить**._

| State | bg | border | bar | label | tag |
|---|---|---|---|---|---|
| `empty` | `#f5f3ed` | `#d8d4c8` | `#c8c4b8` | `#999` | — |
| `emptyOver` | `#fadbb8` | `#d89060` | `#c06820` | `#a04000` | перебор (без плана) |
| `short` | `#fbe0e0` | `#e0a0a0` | `#c04040` | `#a02020` | недобор |
| `close` | `#fbf2d8` | `#d8c068` | `#c89020` | `#a06000` | почти план |
| `norm` | `#d8ead4` | `#7eb070` | `#1a6b3a` | `#1a6b3a` | норма |
| `over` | `#fadbb8` | `#d89060` | `#c06820` | `#a04000` | перебор |

Логика state'ов — [`DOMAIN.md`](DOMAIN.md#cell-state-rule). Реализация — `src/lib/cell-state.ts` + `CELL_STYLES` map.

---

## Status chip palette

_Источник: `reference/project/Wireframes.html` L200–211. **Не редизайнить**._

| Status | bg | border | text | label |
|---|---|---|---|---|
| `scheduled` | `#fbf2d8` | `#d8c068` | `#a06000` | Запланировано |
| `sent` | `#d4e6ed` | `#7eb0c0` | `#1a4868` | Отправлено |
| `arrived` | `#d8ead4` | `#7eb070` | `#1a6b3a` | Прибыло |

Реализация — `src/components/atoms/StatusChip.tsx`. Внутри chip'а рендерится `{emoji} {STATUS_LABELS[status]}`:

| Status | UI label |
|---|---|
| `scheduled` | `📅 Запланировано` |
| `sent` | `🚚 Отправлено` |
| `arrived` | `✓ Прибыло` |

**Никаких enum-name (`sent`, `scheduled`) в visible UI** — пользователь видит только русские labels. Если reference показывает другие emoji, приоритет — reference; но микс «английский enum + русский label» (например `📅 sent ✓`) запрещён.

---

## Raw material palette

_Источник: `reference/project/Wireframes.html` L182–197._

**Single source of truth**: цвета — атрибуты `RawMaterial` в seed (`bg`, `dot` поля). См. [`DOMAIN.md`](DOMAIN.md#3-typescript-types) `RawMaterial` interface.

`src/lib/raw-colors.ts` — **helper над RawRepo**, читает из repo. Никакого дублирующего `RAW_COLORS` map:

```ts
// src/lib/raw-colors.ts
import { RawMaterial } from '@/types/domain';

export function rawColor(rawId: string, raws: RawMaterial[]): { bg: string; dot: string } {
  const r = raws.find(x => x.id === rawId);
  if (!r) return { bg: '#eee', dot: '#999' };
  return { bg: r.bg, dot: r.dot };
}
```

Seed-значения для 13 raw'ов хранятся в `src/data/seed/raws.seed.ts`. UI компонент `RawPill` принимает `rawId` + читает цвета через хук `useRaw(rawId)` или service.

---

### Color source-of-truth rules

| Source | Применение |
|---|---|
| **CSS tokens** (`tokens.css`) | brand colors (`--bg`, `--ink`, `--border`, etc.) |
| **Documented maps** (`CELL_STYLES`, `STATUS_CHIP_STYLES`) | plan cell states, status chip палитра — определены в `src/lib/cell-state.ts` и аналогах |
| **`RawMaterial.bg / dot` seed fields** | raw material colors (13 raws) |

Правила:

- **Компоненты не hardcode hex**, кроме явно задокументированного fallback внутри helper (`rawColor` default `{ bg: '#eee', dot: '#999' }` для unknown rawId).
- **Никаких локальных дубликатов** существующих палитр в компонентах.
- **Запрещён `RAW_COLORS` map** как параллельный источник правды. Если такой map появляется — удалить, использовать seed.
- Cross-document: см. [`DOMAIN.md#3-typescript-types`](DOMAIN.md#3-typescript-types) (RawMaterial), [`IMPLEMENTATION.md#13-folder-structure`](IMPLEMENTATION.md#13-folder-structure) (raw-colors.ts helper).

---

## 4. ProgressBar specs

Используется в Plan cell.

- **Шкала**: 0–150% (overcommit виден до 1.5x от плана).
- **Размер**: ширина 100% от ячейки, высота 8px.
- **Рамка**: 1px solid `#b8b4a8`.
- **Заливка**: цвет `bar` из Plan cell palette, от 0 до `min(100, pct)` относительно шкалы 0–150% (т.е. width = `min(pct, 100) / 150 * 100%`).
- **Штриховка перебора**: поверх отрезка `100..min(150, pct)`:
  ```css
  background-image: repeating-linear-gradient(
    135deg,
    transparent 0 4px,
    rgba(192, 104, 32, 0.3) 4px 8px
  );
  ```
- **Маркер 100%**: вертикальная полоса 1px цвета `#333`, позиция `100/150 = 66.67%` от ширины бара.

Реализация — `src/components/atoms/ProgressBar.tsx`. Источник правил — `reference/project/plan-view.jsx` L199–280.

---

## 5. Scrollbar

`.wsm-scroll` — appear-on-hover overlay scrollbar. Не системный (так как тёмная серая полоса убивает sketch-стиль).

CSS (`src/styles/sketch.css`):

```css
.wsm-scroll::-webkit-scrollbar { width: 8px; height: 8px; }
.wsm-scroll::-webkit-scrollbar-thumb {
  background: transparent;
  border-radius: 4px;
}
.wsm-scroll:hover::-webkit-scrollbar-thumb {
  background: rgba(42, 42, 42, 0.3);
}
.wsm-scroll { scrollbar-width: thin; scrollbar-color: transparent transparent; }
.wsm-scroll:hover { scrollbar-color: rgba(42,42,42,0.3) transparent; }
```

Применяется к: TableView weeks list, Form E items list, DriversRef table, ⚙ popover.

---

## 6. Date inputs

- **Native `<input type="date">`** — без сторонних date picker'ов.
- Стилизация через CSS: рамка, padding, font-family совпадают с другими input'ами. Pop-up календарь Chrome — приемлемый компромисс, не стилизуется глубоко.
- В Plan-mode prefilled `arrDate` — **`readonly`, не `disabled`**:
  - `readonly` оставляет значение в форме (входит в submit), визуально консистентный.
  - `disabled` исключил бы значение и сломал бы submit + выглядел бы серым «выключенным» полем.
- **Sunday-block validation применяется независимо от prefill**: даже если значение пришло из locked plan-cell, валидация проверяет `!isSunday(arrDate)` при save. Plan grid Mon–Sat only, поэтому Sunday prefill технически невозможен через UI; но safety check в validation layer обязателен.
- Save валидирует `shipDate <= arrDate` и `kg > 0` для всех позиций — независимо от prefill.
- Seed и plan cells **не должны** содержать Sunday `arrDate`.

---

## 7. UI placeholder rules

Активные UI-контролы без логики выглядят рабочими — это UX-провал. Общие принципы Phase 1:

- **No state change on click**: disabled placeholder не меняет state приложения.
- **`disabled` атрибут ИЛИ `aria-disabled="true"`** — обязательно. Без визуального признака запрещено.
- **Tooltip «Phase 2»** (или «Phase 3») — обязателен, чтобы пользователь понял, почему не работает.
- **Если control выглядит слишком активным и нет логики** — лучше скрыть/удалить, чем оставлять disabled.

Phase 1 placeholder mapping:

| Контрол | Phase 1 behavior |
|---|---|
| **TableView Period dropdown** | **Удалён**. Period-фильтр перенесён в Phase 2. |
| **TableView search** | Не отображается в Phase 1. Phase 2. |
| **TableView фильтр поставщик/ТК** | Не отображается. Phase 2. |
| **Heatmap «Сумма (кг)»** | Активна, единственная рабочая. |
| **Heatmap «Среднее за день»** | `disabled` + `aria-disabled="true"` + tooltip «Phase 2». Визуально видна, но не кликабельна. |
| **Heatmap «% от плана недели»** | То же — `disabled` + tooltip «Phase 2». |
| **Sidebar заглушки** для Admin (Логистика, Контракты, Аналитика, …) | Видны, кликабельны. Открывают `<StubPage>` «Раздел в работе (Phase 2)» или «(Phase 3)». |
| **DriverModal «Открыть карточку ТК»** | `disabled` + tooltip «Phase 2». |
| **Form E `arrived` поля акта** | Скрыты в Phase 1 (как и весь раздел качества). Phase 2 — отображаются, редактируются Admin. |

Принцип: либо `disabled` с явным tooltip и `aria-disabled`, либо удалён вовсе.

---

## 8. Accessibility baseline

Phase 1 — минимальная семантика, без deep audit:

- `<button>` для всех кликабельных элементов (не `<div onClick>`).
- `aria-label` на icon-only кнопках (🗑, ✏, ⚙, ✓, ✕).
- `aria-disabled="true"` на disabled-плейсхолдерах (Heatmap mode buttons).
- Focus-ring на input'ах и кнопках (через `:focus-visible`).
- Контраст: используем готовые палитры из reference — там уровни нормальные.
- Кнопка «📋 копировать» — `aria-label="Копировать телефон"`.
- Модалки: `<Modal>` атом с focus trap (Phase 1 — простой; Phase 2+ — улучшить).

**Deep a11y audit** — Phase 2+ (см. [`TASKS.md`](TASKS.md)).

---

## Reference bundle map

`reference/` (frozen, **не трогать**) содержит:

| Файл | Назначение |
|---|---|
| `reference/README.md` | Описание бандла |
| `reference/project/Wireframes.html` | Главный источник правды по UX (все экраны Variant A/B/C/D/E) |
| `reference/project/plan-view.jsx` | Plan mode reference: getCellState, ProgressBar, FullShipmentFormModal |
| `reference/project/pivot-summary.jsx` | Heatmap reference (PivotV2) |
| `reference/project/references-extras.jsx` | DriversRef |
| `reference/project/contracts.jsx` | Контракты UI (Phase 2 reference) |
| `reference/project/analytics.jsx` | Аналитика (Phase 2 reference) |
| `reference/project/logistics.jsx` | Логистика материалов (Phase 2 reference) |
| `reference/project/raw-quality.jsx` | Карточка сырья с qualityParams (Phase 2 reference) |
| `reference/project/supplier-card-tabs.jsx` | Карточка поставщика (Phase 2 reference) |
| `reference/project/quality-modal.jsx` | Модалка качества приёмки (Phase 2 reference) |
| `reference/project/notifications.jsx` | Уведомления (Phase 3 reference) |
| `reference/project/print-views.jsx` | Печатные формы (Phase 3 reference) |
| `reference/project/mobile-list.jsx`, `mobile-detail-form.jsx`, `mobile-tara-analytics.jsx` | Мобильная версия (Phase 3 reference) |
| `reference/project/settings.jsx` | Настройки (Phase 3 reference) |
| `reference/project/design-canvas.jsx`, `android-frame.jsx` | UI library / mobile frame (только для reference) |
| `reference/chats/chat1.md` … `chat23.md` | История решений: P2/M2 selection, driver modal, settings, Plan mode эволюция |

> **Phase 1 кодинг должен ссылаться на reference как на «как должно выглядеть», но не копировать jsx один-к-одному — это прототипы, не production-ready.**

— конец DESIGN.md —
