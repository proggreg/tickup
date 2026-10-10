<script setup lang="ts">
type ListSettings = Pick<List, 'name' | 'icon' | 'defaultView' | 'defaultSort' | 'githubRepo'>;

const ICONS = [
  'mdi-briefcase-outline',
  'mdi-home-outline',
  'mdi-cart-outline',
  'mdi-book-open-variant',
  'mdi-dumbbell',
  'mdi-code-tags',
  'mdi-airplane',
  'mdi-heart-outline',
  'mdi-star-outline',
  'mdi-lightbulb-outline',
  'mdi-cash',
  'mdi-school-outline',
];

const VIEWS: { value: View; title: string; icon: string }[] = [
  { value: 'list', title: 'List', icon: 'mdi-format-list-bulleted' },
  { value: 'board', title: 'Board', icon: 'mdi-view-column-outline' },
];

const route = useRoute();
const listsStore = useListsStore();
const { currentList } = storeToRefs(listsStore);
const { sortOptions } = storeToRefs(useSettingsStore());

// Snapshot of the last persisted values; edits go straight onto currentList
// (GithubRepoSelect writes there too) and are compared against this to detect changes.
const saved = ref<ListSettings>({ name: '' });
const linking = ref(false);
const deleteDialog = ref(false);
const saving = ref(false);

const snapshot = (): ListSettings => ({
  name: currentList.value.name,
  icon: currentList.value.icon,
  defaultView: currentList.value.defaultView,
  defaultSort: currentList.value.defaultSort,
  githubRepo: currentList.value.githubRepo,
});

const dirty = computed(() =>
  (Object.keys(saved.value) as (keyof ListSettings)[]).some(
    key => (currentList.value[key] ?? null) !== (saved.value[key] ?? null),
  ),
);

const githubLinked = computed(() => !!currentList.value.githubRepo || linking.value);
const todoCount = computed(() => currentList.value.todos?.length ?? 0);

onBeforeMount(async () => {
  await listsStore.getList(route.params.id as string);
  saved.value = snapshot();
});

const unlinkGithub = () => {
  currentList.value.githubRepo = undefined;
  linking.value = false;
};

const discard = () => {
  Object.assign(currentList.value, saved.value);
  linking.value = false;
};

const save = async () => {
  saving.value = true;
  await listsStore.updateList();
  saved.value = snapshot();
  linking.value = false;
  saving.value = false;
};

const deleteList = async () => {
  deleteDialog.value = false;
  await listsStore.deleteList(currentList.value.id);
};
</script>

<template>
  <v-container fluid class="h-100 w-100 pa-8 align-self-stretch">
    <div class="d-flex flex-column ga-9">
      <!-- Header -->
      <div class="d-flex flex-column ga-1">
        <div class="d-flex align-center ga-1 text-body-2 text-medium-emphasis">
          <v-icon :icon="saved.icon || 'mdi-format-list-bulleted'" size="small" />
          <NuxtLink :to="`/list/${currentList.id}`" class="text-medium-emphasis text-decoration-none">
            {{ saved.name }}
          </NuxtLink>
          <v-icon icon="mdi-chevron-right" size="small" class="text-disabled" />
          <span>Settings</span>
        </div>
        <h1 class="text-h4 font-weight-bold">
          List settings
        </h1>
      </div>

      <!-- List -->
      <v-row>
        <v-col cols="12" md="6">
          <section class="d-flex flex-column ga-4">
            <div>
              <h2 class="text-h5 font-weight-bold">
                List
              </h2>
              <p class="text-body-2 text-medium-emphasis">
                How this list looks and behaves.
              </p>
            </div>

            <v-card variant="flat" border rounded="lg">
              <v-list lines="two" class="py-1">
                <v-list-item title="Name">
                  <template #append>
                    <v-text-field v-model="currentList.name" hide-details width="240" data-testid="list-name-input" />
                  </template>
                </v-list-item>

                <v-divider class="mx-4" />

                <v-list-item title="Icon">
                  <div class="d-flex flex-wrap ga-2 mt-3">
                    <v-btn v-for="icon in ICONS" :key="icon" :icon="icon" :title="icon"
                      :color="currentList.icon === icon ? 'primary' : undefined"
                      :variant="currentList.icon === icon ? 'tonal' : 'text'" rounded="lg" size="small"
                      @click="currentList.icon = icon" />
                  </div>
                </v-list-item>

                <v-divider class="mx-4" />

                <v-list-item title="Default view" subtitle="Shown when you open this list.">
                  <template #append>
                    <v-btn-toggle v-model="currentList.defaultView" variant="tonal" density="compact" rounded="lg"
                      divided data-testid="list-default-view-select">
                      <v-btn v-for="view in VIEWS" :key="view.value" :value="view.value" :prepend-icon="view.icon"
                        :text="view.title" class="text-none" />
                    </v-btn-toggle>
                  </template>
                </v-list-item>

                <v-divider class="mx-4" />

                <v-list-item title="Sort todos by" subtitle="Applied when you open this list.">
                  <template #append>
                    <v-select v-model="currentList.defaultSort" :items="sortOptions" item-title="text"
                      item-value="value" hide-details width="180" data-testid="list-default-sort-select" />
                  </template>
                </v-list-item>
              </v-list>
            </v-card>

            <v-card variant="flat" border rounded="lg">
              <v-list class="py-1">
                <v-list-item title="Delete list" :subtitle="`Removes the list and its ${todoCount} todos.`"
                  base-color="error" append-icon="mdi-arrow-right" data-testid="list-delete-button"
                  @click="deleteDialog = true">
                  <template #prepend>
                    <v-avatar color="error" variant="tonal" rounded="lg" size="32">
                      <v-icon icon="mdi-trash-can-outline" size="small" />
                    </v-avatar>
                  </template>
                </v-list-item>
              </v-list>
            </v-card>
          </section>
        </v-col>

        <!-- Integration -->
        <v-col cols="12" md="6">
          <section class="d-flex flex-column ga-4">
            <div>
              <h2 class="text-h5 font-weight-bold">
                Integration
              </h2>
              <p class="text-body-2 text-medium-emphasis">
                Link a GitHub repository to bring its issues into this list.
              </p>
            </div>

            <v-card variant="flat" border rounded="lg" data-testid="list-settings-github-column">
              <v-list lines="two" class="py-1">
                <v-list-item :subtitle="currentList.githubRepo
                    ? `Syncing issues from ${currentList.githubRepo}`
                    : 'Not linked to a repository.'
                  ">
                  <template #prepend>
                    <v-avatar color="surface-variant" variant="tonal" rounded="lg">
                      <v-icon icon="mdi-github" />
                    </v-avatar>
                  </template>
                  <template #title>
                    <div class="d-flex align-center ga-2">
                      <span class="font-weight-bold">GitHub</span>
                      <v-chip v-if="currentList.githubRepo" color="success" size="x-small"
                        prepend-icon="mdi-circle-medium" text="Linked" />
                    </div>
                  </template>
                  <template #append>
                    <v-btn v-if="githubLinked" variant="outlined" color="error" size="small" class="text-none"
                      text="Unlink" @click="unlinkGithub" />
                    <v-btn v-else variant="flat" color="primary" size="small" class="text-none" text="Link repository"
                      @click="linking = true" />
                  </template>
                </v-list-item>

                <template v-if="githubLinked">
                  <v-divider inset />
                  <v-list-item title="Repository" class="pl-16">
                    <template #append>
                      <div style="width: 240px">
                        <GithubRepoSelect />
                      </div>
                    </template>
                  </v-list-item>
                </template>
              </v-list>
            </v-card>
          </section>
        </v-col>
      </v-row>
    </div>

    <!-- Unsaved changes bar -->
    <v-snackbar :model-value="dirty" :timeout="-1" location="bottom" rounded="lg" color="surface">
      <span class="text-medium-emphasis">Unsaved changes</span>
      <template #actions>
        <v-btn variant="outlined" class="text-none" text="Discard" @click="discard" />
        <v-btn variant="flat" color="primary" class="text-none ml-2" text="Save changes" :loading="saving"
          @click="save" />
      </template>
    </v-snackbar>

    <!-- Delete confirmation -->
    <v-dialog v-model="deleteDialog" max-width="400">
      <v-card title="Delete list?" :text="`“${saved.name}” and its ${todoCount} todos will be permanently removed.`">
        <template #actions>
          <v-btn text="Cancel" @click="deleteDialog = false" />
          <v-btn color="error" variant="flat" text="Delete" data-testid="list-delete-confirm" @click="deleteList" />
        </template>
      </v-card>
    </v-dialog>
  </v-container>
</template>
