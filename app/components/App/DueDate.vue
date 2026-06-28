<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue';

const emit = defineEmits<{
  setDate: [newDate: Date | null, newTodo: Todo];
  setDate: [newDate: Date | null, newTodo: Todo];
}>();

const props = defineProps<{
  todo: Todo;
  todoDueDate?: Date | string;
  date?: Date | string; // alias used by Todo/New.vue
  showDetail?: boolean;
  todo: Todo;
  todoDueDate?: Date | string;
  date?: Date | string; // alias used by Todo/New.vue
  showDetail?: boolean;
}>();

// ── Date helpers (ported from prototype) ─────────────────────────────────────
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function addDays(d: Date, n: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

function sameDay(a: Date | null | undefined, b: Date | null | undefined): boolean {
  return !!(a && b && startOfDay(a).getTime() === startOfDay(b).getTime());
}

function nextWeekday(target: number): Date {
  // 0=Sun..6=Sat
  const t = startOfDay(new Date());
  for (let i = 1; i <= 7; i++) {
    const d = addDays(t, i);
    if (d.getDay() === target) return d;
  }
  return t;
}

function formatRelative(d: Date | null): string | null {
  if (!d) return null;
  const t = startOfDay(new Date());
  const diff = Math.round((startOfDay(d).getTime() - t.getTime()) / 86400000);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Tomorrow';
  if (diff === -1) return 'Yesterday';
  if (diff > 1 && diff < 7) return d.toLocaleDateString('en-GB', { weekday: 'long' });
  return d.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: d.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
  });
}

function buildMonthGrid(year: number, month: number): (Date | null)[] {
  const first = new Date(year, month, 1);
  const startWeekday = (first.getDay() + 6) % 7; // Mon=0
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (Date | null)[] = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

// ── Derived state ─────────────────────────────────────────────────────────────
const effectiveDate = computed<Date | null>(() => {
  const raw = props.todoDueDate ?? props.date;
  return raw ? new Date(raw) : null;
});

const isOverdue = computed(
  () =>
    !!effectiveDate.value &&
    startOfDay(effectiveDate.value) < startOfDay(new Date()) &&
    props.todo.status !== 'Closed',
);

const isToday_ = computed(() => sameDay(effectiveDate.value, new Date()));

const chipStyle = computed(() => {
  if (!effectiveDate.value) {
    return {
      color: 'rgba(42,52,57,0.38)',
      background: 'transparent',
      borderColor: 'rgba(113,124,130,0.24)',
    };
  }
  if (isOverdue.value) {
    return { color: '#ba1b24', background: 'rgba(186,27,36,0.08)', borderColor: 'transparent' };
  }
  if (isToday_.value) {
    return { color: '#005ac2', background: '#dce8ff', borderColor: 'transparent' };
  }
  return { color: '#2a3439', background: '#f0f4f7', borderColor: 'transparent' };
  if (!effectiveDate.value) {
    return {
      color: 'rgba(42,52,57,0.38)',
      background: 'transparent',
      borderColor: 'rgba(113,124,130,0.24)',
    };
  }
  if (isOverdue.value) {
    return { color: '#ba1b24', background: 'rgba(186,27,36,0.08)', borderColor: 'transparent' };
  }
  if (isToday_.value) {
    return { color: '#005ac2', background: '#dce8ff', borderColor: 'transparent' };
  }
  return { color: '#2a3439', background: '#f0f4f7', borderColor: 'transparent' };
});

const rowStyle = computed(() => ({
  color: isOverdue.value ? '#ba1b24' : effectiveDate.value ? '#2a3439' : 'rgba(42,52,57,0.38)',
  fontWeight: isOverdue.value ? 500 : 400,
  color: isOverdue.value ? '#ba1b24' : effectiveDate.value ? '#2a3439' : 'rgba(42,52,57,0.38)',
  fontWeight: isOverdue.value ? 500 : 400,
}));

// ── Popover state ─────────────────────────────────────────────────────────────
const open = ref(false);
const popoverEl = ref<HTMLElement | null>(null);
const triggerEl = ref<HTMLElement | null>(null);
const popoverPos = ref({ left: 0, top: 0, ready: false });

// ── Calendar state ────────────────────────────────────────────────────────────
const viewYear = ref(new Date().getFullYear());
const viewMonth = ref(new Date().getMonth());

const calendarCells = computed(() => buildMonthGrid(viewYear.value, viewMonth.value));

function prevMonth() {
  if (viewMonth.value === 0) {
    viewMonth.value = 11;
    viewYear.value--;
  } else viewMonth.value--;
}

function nextMonth() {
  if (viewMonth.value === 11) {
    viewMonth.value = 0;
    viewYear.value++;
  } else viewMonth.value++;
}

// ── Quick options ─────────────────────────────────────────────────────────────
const quicks = computed(() => {
  const t = new Date();
  return [
    {
      icon: 'mdi-white-balance-sunny',
      label: 'Today',
      accent: '#f07c20',
      hint: t.toLocaleDateString('en-GB', { weekday: 'short' }),
      date: startOfDay(t),
    },
    {
      icon: 'mdi-weather-sunset-up',
      label: 'Tomorrow',
      accent: '#005ac2',
      hint: addDays(t, 1).toLocaleDateString('en-GB', { weekday: 'short' }),
      date: addDays(startOfDay(t), 1),
    },
    {
      icon: 'mdi-calendar-weekend',
      label: 'This weekend',
      accent: '#506076',
      hint: 'Sat',
      date: nextWeekday(6),
    },
    {
      icon: 'mdi-calendar-arrow-right',
      label: 'Next week',
      accent: '#506076',
      hint: 'Mon',
      date: nextWeekday(1),
    },
  ];
});

// ── Popover open/close/position ───────────────────────────────────────────────
async function openPicker() {
  if (!triggerEl.value) return;
  const d = effectiveDate.value ?? new Date();
  viewYear.value = d.getFullYear();
  viewMonth.value = d.getMonth();
  open.value = true;
  await nextTick();
  positionPopover();
}

function positionPopover() {
  if (!popoverEl.value || !triggerEl.value) return;
  const a = triggerEl.value.getBoundingClientRect();
  const r = popoverEl.value.getBoundingClientRect();
  let left = a.left;
  let top = a.bottom + 6;
  if (left + r.width > window.innerWidth - 8) left = window.innerWidth - r.width - 8;
  if (top + r.height > window.innerHeight - 8) top = a.top - r.height - 6;
  if (top < 8) top = 8;
  if (left < 8) left = 8;
  popoverPos.value = { left, top, ready: true };
}

function closePicker() {
  open.value = false;
  popoverPos.value = { left: 0, top: 0, ready: false };
}

function handleSelect(d: Date) {
  emit('setDate', d, { ...props.todo, dueDate: d });
  closePicker();
}

function handleClear() {
  emit('setDate', null, { ...props.todo, dueDate: undefined });
  closePicker();
}

function handleOutsideClick(e: MouseEvent) {
  if (!open.value) return;
  const t = e.target as Node;
  if (
    popoverEl.value &&
    !popoverEl.value.contains(t) &&
    triggerEl.value &&
    !triggerEl.value.contains(t)
  )
    closePicker();
}

function handleEsc(e: KeyboardEvent) {
  if (e.key === 'Escape' && open.value) closePicker();
}

onMounted(() => {
  document.addEventListener('mousedown', handleOutsideClick);
  document.addEventListener('keydown', handleEsc);
});

onUnmounted(() => {
  document.removeEventListener('mousedown', handleOutsideClick);
  document.removeEventListener('keydown', handleEsc);
});
</script>

<template>
  <!-- Chip variant (default) -->
  <button v-if="!showDetail" ref="triggerEl" class="due-chip" :style="chipStyle" data-testid="due-date-trigger"
    @click="openPicker">
    <i class="mdi" :class="isOverdue ? 'mdi-calendar-alert' : 'mdi-calendar'" style="font-size: 14px" />
    <span>{{ effectiveDate ? formatRelative(effectiveDate) : 'Set date' }}</span>
  </button>

  <!-- Row variant (showDetail) -->
  <button v-else ref="triggerEl" class="due-row" :style="rowStyle" data-testid="due-date-trigger" @click="openPicker">
    <i v-if="isOverdue" class="mdi mdi-alert-circle-outline" style="font-size: 13px" />
    <span>{{ effectiveDate ? formatRelative(effectiveDate) : 'Add due date' }}</span>
  </button>

  <!-- Popover -->
  <Teleport to="body">
    <div v-if="open" ref="popoverEl" class="due-popover" :style="{
      left: popoverPos.left + 'px',
      top: popoverPos.top + 'px',
      opacity: popoverPos.ready ? 1 : 0,
      transform: popoverPos.ready ? 'translateY(0)' : 'translateY(-4px)',
    }" data-testid="due-date-popover">
      <!-- Quick options -->
      <div class="due-quicks">
        <button v-for="q in quicks" :key="q.label" class="due-quick" @click="handleSelect(q.date)">
          <i class="mdi" :class="q.icon" :style="{
            fontSize: '17px',
            width: '20px',
            textAlign: 'center',
            color: q.accent,
          }" />
          <span class="due-quick__label">{{ q.label }}</span>
          <span class="due-quick__hint">{{ q.hint }}</span>
        </button>
      </div>

      <!-- Calendar -->
      <div class="due-calendar">
        <div class="due-cal__header">
          <span class="due-cal__month-label">{{ MONTHS[viewMonth] }} {{ viewYear }}</span>
          <div style="display: flex; gap: 2px">
            <button class="due-cal__nav" @click="prevMonth">
              <i class="mdi mdi-chevron-left" style="font-size: 18px" />
            </button>
            <button class="due-cal__nav" @click="nextMonth">
              <i class="mdi mdi-chevron-right" style="font-size: 18px" />
            </button>
          </div>
        </div>

        <div class="due-cal__weekdays">
          <div v-for="d in DAYS" :key="d">
            {{ d }}
          </div>
        </div>

        <div class="due-cal__grid">
          <template v-for="(d, i) in calendarCells" :key="i">
            <div v-if="!d" />
            <button v-else class="due-day" :class="{
              'due-day--selected': sameDay(d, effectiveDate),
              'due-day--today':
                sameDay(d, new Date()) && !sameDay(d, effectiveDate),
            }" @click="handleSelect(d)">
              {{ d.getDate() }}
            </button>
          </template>
        </div>
      </div>

      <!-- Footer -->
      <div class="due-footer">
        <button class="due-clear" @click="handleClear">
          <i class="mdi mdi-close-circle-outline" style="font-size: 15px" />
          Clear
        </button>
        <span class="due-footer__preview">
          {{ effectiveDate ? formatRelative(effectiveDate) : 'No date set' }}
        </span>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
/* ── Chip trigger ─────────────────────────────────────────────────────────── */
.due-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 20px;
  border: 1px solid transparent;
  font-size: 0.8125rem;
  font-weight: 500;
  font-family: Inter, sans-serif;
  cursor: pointer;
  white-space: nowrap;
  transition: opacity 0.08s;
}

.due-chip:hover {
  opacity: 0.8;
}

/* ── Row trigger ──────────────────────────────────────────────────────────── */
.due-row {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px;
  border-radius: 7px;
  border: none;
  background: transparent;
  font-size: 0.875rem;
  font-family: Inter, sans-serif;
  cursor: pointer;
  transition: background 0.08s;
}

.due-row:hover {
  background: rgba(113, 124, 130, 0.1);
}

/* ── Popover panel ────────────────────────────────────────────────────────── */
.due-popover {
  position: fixed;
  z-index: 2000;
  width: 300px;
  background: #ffffff;
  border: 1px solid rgba(113, 124, 130, 0.16);
  border-radius: 14px;
  box-shadow:
    0 12px 40px rgba(42, 52, 57, 0.18),
    0 2px 8px rgba(42, 52, 57, 0.06);
  overflow: hidden;
  transition:
    opacity 0.12s,
    transform 0.12s;
}

/* ── Quick options ────────────────────────────────────────────────────────── */
.due-quicks {
  padding: 6px;
  border-bottom: 1px solid rgba(113, 124, 130, 0.16);
}

.due-quick {
  display: flex;
  align-items: center;
  gap: 11px;
  width: 100%;
  padding: 8px 10px;
  border: none;
  border-radius: 7px;
  cursor: pointer;
  background: transparent;
  color: #2a3439;
  font-family: Inter, sans-serif;
  font-size: 0.875rem;
  font-weight: 500;
  text-align: left;
  transition: background 0.08s;
}

.due-quick:hover {
  background: rgba(113, 124, 130, 0.1);
}

.due-quick__label {
  flex: 1;
}

.due-quick__hint {
  font-size: 0.75rem;
  color: rgba(42, 52, 57, 0.38);
}

/* ── Calendar ─────────────────────────────────────────────────────────────── */
.due-calendar {
  padding: 8px 10px;
}

.due-cal__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4px 6px 10px;
}

.due-cal__month-label {
  font-family: Manrope, sans-serif;
  font-weight: 700;
  font-size: 0.875rem;
  color: #2a3439;
}

.due-cal__nav {
  width: 26px;
  height: 26px;
  border-radius: 6px;
  border: none;
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(42, 52, 57, 0.55);
  transition: background 0.08s;
}

.due-cal__nav:hover {
  background: rgba(113, 124, 130, 0.1);
}

.due-cal__weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  margin-bottom: 2px;
}

.due-cal__weekdays>div {
  text-align: center;
  font-size: 0.625rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: rgba(42, 52, 57, 0.38);
  padding: 4px 0;
}

.due-cal__grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
}

/* ── Day cell ─────────────────────────────────────────────────────────────── */
.due-day {
  aspect-ratio: 1;
  border: 1px solid transparent;
  border-radius: 8px;
  background: transparent;
  color: #2a3439;
  cursor: pointer;
  font-size: 0.8125rem;
  font-weight: 500;
  font-family: Inter, sans-serif;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.08s;
}

.due-day:hover {
  background: rgba(113, 124, 130, 0.1);
}

.due-day--today {
  border-color: #005ac2;
  color: #005ac2;
  font-weight: 700;
}

.due-day--selected {
  background: #005ac2 !important;
  color: #ffffff;
  font-weight: 700;
  border-color: transparent;
}

/* ── Footer ───────────────────────────────────────────────────────────────── */
.due-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 10px;
  border-top: 1px solid rgba(113, 124, 130, 0.16);
  background: #f7f9fb;
}

.due-clear {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 5px 8px;
  border: none;
  background: transparent;
  border-radius: 6px;
  cursor: pointer;
  color: #ba1b24;
  font-size: 0.8125rem;
  font-weight: 500;
  font-family: Inter, sans-serif;
  transition: background 0.08s;
}

.due-clear:hover {
  background: rgba(186, 27, 36, 0.08);
}

.due-footer__preview {
  font-size: 0.75rem;
  color: rgba(42, 52, 57, 0.38);
}
</style>