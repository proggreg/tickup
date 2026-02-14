---
name: vue-component
description: Create a new Vue component for the Tickup project. Use when asked to build, add, or scaffold a Vue component. Handles file placement, naming conventions, props, emits, composables, Vuetify UI, and data-testid attributes.
---

# Vue Component Skill

## Project Conventions

### File Placement
Components live in `app/components/` grouped by feature folder:
- `App/` — shared app-wide components (nav, dialogs, buttons, empty states)
- `HomePage/` — home page sections (today, overdue, tabs)
- `Todo/` — todo item views and forms
- `List/` — list management components
- `Board/` — board/kanban views
- `DashBoard/` — dashboard widgets
- `Github/` — GitHub integration components
- `Search/` — search UI

Place new components in the most relevant folder. If it's a multi-file component, create a subdirectory with `index.vue`.

Nuxt auto-imports components using the folder+filename as the component name:
- `app/components/App/DeleteButton.vue` → `<AppDeleteButton />`
- `app/components/Todo/Form.vue` → `<TodoForm />`
- `app/components/Board/index.vue` → `<Board />`

### Script Setup
Always use `<script setup lang="ts">`. No Options API.

```vue
<script setup lang="ts">
// props, emits, composables, computed, methods here
</script>
```

### Props
Use typed `defineProps` with a TypeScript interface. Use `withDefaults` for optional props:

```ts
interface Props {
  label: string;
  disabled?: boolean;
  variant?: 'primary' | 'secondary';
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  variant: 'primary',
});
```

### Emits
Use typed `defineEmits`:

```ts
const emit = defineEmits<{
  submit: [value: string];
  cancel: [];
}>();
```

### Composables
Auto-imported — no import statements needed for composables in `app/composables/`. Use the existing ones where relevant:
- `useTodoActions()` — todo selection, status changes, date formatting
- `useListsStore()` — Pinia store for lists and todos (also auto-imported)
- `useDialog()` — shared dialog open/close state
- `useToolbar()` — toolbar visibility
- `useNotification()` — toast notifications
- `useCurrentUser()` — current authenticated user
- `useAppLayout()` — layout state
- `ref`, `computed`, `watch`, `nextTick` — auto-imported from Vue

### UI Framework: Vuetify 3
Use Vuetify components. Common ones in this project:
- `<v-card>`, `<v-card-text>`, `<v-card-actions>`, `<v-card-title>`, `<v-card-item>`
- `<v-btn>` — always use `variant="text"` for icon-only buttons
- `<v-list>`, `<v-list-item>`, `<v-list-item-title>`, `<v-list-item-subtitle>`
- `<v-dialog>` — use `#activator` and `#default` slots
- `<v-text-field>`, `<v-textarea>`, `<v-checkbox>`, `<v-select>`
- `<v-icon>` — use Material Design Icons with `mdi-` prefix
- `<v-empty-state>` — for empty/zero-state screens

### data-testid Attributes
Add `data-testid` to every meaningful interactive or key display element for Playwright tests:

```vue
<v-btn data-testid="submit-btn" @click="submit">Save</v-btn>
<v-card-title data-testid="component-title">{{ title }}</v-card-title>
```

### Template Style
- Use `variant="flat"` on cards unless there's a reason for elevation
- Use `<v-spacer />` in `<v-card-actions>` to push buttons right
- Use `class="font-weight-bold"` on titles
- 4-space indentation throughout

## Steps

1. **Clarify** what the component does if the description is vague. Ask:
   - What does it display or do?
   - What data does it receive (props)?
   - Does it emit events back to the parent?
   - Does it need any store or composable access?
   - Which feature folder should it live in?

2. **Determine the file path** using the naming convention above.

3. **Write the component** following the structure below.

4. **Check for reuse** — scan existing components in the relevant folder (`read` the directory) before creating anything new, to avoid duplication.

5. **Register nothing** — Nuxt auto-imports all components in `app/components/`. No manual registration needed.

6. **Show usage** — after creating the file, show a snippet of how to use it in a parent template.

## Component Template

```vue
<script setup lang="ts">
// 1. Props
interface Props {
  // required and optional props
}
const props = withDefaults(defineProps<Props>(), {
  // defaults for optional props
});

// 2. Emits (if needed)
const emit = defineEmits<{
  // event: [payload type]
}>();

// 3. Composables / store (if needed)
// const store = useListsStore();
// const { formatDate } = useTodoActions();

// 4. Local state
// const loading = ref(false);

// 5. Computed properties
// const formattedValue = computed(() => ...);

// 6. Methods / handlers
// async function handleSubmit() { ... }
</script>

<template>
  <!-- Root element: typically a v-card or div -->
  <v-card variant="flat">
    <v-card-title
      class="font-weight-bold"
      data-testid="COMPONENT-title"
    >
      <!-- title -->
    </v-card-title>

    <v-card-text>
      <!-- main content -->
    </v-card-text>

    <v-card-actions>
      <v-spacer />
      <!-- action buttons -->
    </v-card-actions>
  </v-card>
</template>
```

## Example: Simple Display Component

`app/components/Todo/StatusBadge.vue`

```vue
<script setup lang="ts">
interface Props {
  status: 'Open' | 'Closed';
}

defineProps<Props>();
</script>

<template>
  <v-chip
    :color="status === 'Closed' ? 'success' : 'warning'"
    data-testid="todo-status-badge"
    size="small"
  >
    {{ status }}
  </v-chip>
</template>
```

## Example: Interactive Form Component

`app/components/Todo/QuickAdd.vue`

```vue
<script setup lang="ts">
interface Props {
  listId: number;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  added: [name: string];
}>();

const store = useListsStore();
const name = ref('');
const loading = ref(false);

async function handleSubmit() {
  if (!name.value.trim()) return;
  loading.value = true;
  await store.addTodo({ name: name.value, listId: props.listId });
  emit('added', name.value);
  name.value = '';
  loading.value = false;
}
</script>

<template>
  <v-card variant="flat">
    <v-card-text>
      <v-text-field
        v-model="name"
        data-testid="quick-add-input"
        label="New todo"
        placeholder="What needs doing?"
        @keyup.enter="handleSubmit"
      />
    </v-card-text>
    <v-card-actions>
      <v-spacer />
      <v-btn
        :loading="loading"
        color="primary"
        data-testid="quick-add-submit"
        @click="handleSubmit"
      >
        Add
      </v-btn>
    </v-card-actions>
  </v-card>
</template>
```
