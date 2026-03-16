<script setup lang="ts">
definePageMeta({
    layout: 'mobile',
});

const store = useListsStore();

onBeforeMount(() => {
    store.getLists();
});
</script>

<template>
    <div class="d-flex flex-column h-100 pb-20">
        <div class="d-flex align-center ga-3 px-5 pt-8 pb-4 flex-shrink-0">
            <span class="text-h5 font-weight-bold">My Lists</span>
            <v-chip
                v-if="store.lists.length"
                size="small"
                variant="tonal"
                label
            >
                {{ store.lists.length }}
            </v-chip>
        </div>

        <div
            v-if="store.lists.length === 0"
            class="d-flex flex-column align-center justify-center flex-grow-1 pa-8 text-center"
        >
            <v-icon
                icon="mdi-playlist-plus"
                size="56"
                class="text-disabled mb-3"
            />
            <p class="text-body-1 font-weight-medium text-medium-emphasis mb-1">
                No lists yet
            </p>
            <p class="text-body-2 text-disabled">
                Tap the button below to create your first list
            </p>
        </div>

        <v-list
            v-else
            class="px-3 flex-grow-1 bg-transparent"
            style="overflow-y: auto;"
        >
            <v-list-item
                v-for="item in store.lists"
                :key="item.id"
                :to="`/list/${item.id}`"
                rounded="xl"
                class="mb-2"
                base-color="surface-variant"
                variant="tonal"
                min-height="62"
            >
                <template #prepend>
                    <v-avatar
                        rounded="lg"
                        size="36"
                        variant="tonal"
                        class="mr-3"
                    >
                        <v-icon
                            :icon="item.icon || 'mdi-format-list-bulleted'"
                            size="18"
                        />
                    </v-avatar>
                </template>

                <v-list-item-title class="font-weight-bold text-capitalize">
                    {{ item.name }}
                </v-list-item-title>

                <template #append>
                    <div class="d-flex align-center">
                        <span
                            v-if="item.todos?.length"
                            class="text-caption font-weight-medium text-medium-emphasis mr-1"
                        >
                            {{ item.todos.length }}
                        </span>
                        <ListMenu :list-id="item.id" />
                    </div>
                </template>
            </v-list-item>
        </v-list>

        <ListNew />
    </div>
</template>
