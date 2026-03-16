<script setup lang="ts">
const listsStore = useListsStore();
const { isMobile } = useDevice();
const { listId } = defineProps<{
    listId: string;
}>();

function deleteList() {
    console.log('Delete List');

    listsStore.deleteList(listId);

    let route = '/lists';
    if (!isMobile) {
        route = '/';
    }
    navigateTo(route);
}
</script>

<template>
    <v-menu
        location="bottom end"
        :close-on-content-click="true"
    >
        <template #activator="{ props: menuProps }">
            <v-btn
                icon="mdi-dots-vertical"
                :data-testid="`setting-button-${listId}`"
                v-bind="menuProps"
                @click.stop.prevent
            />
        </template>
        <v-list>
            <v-list-item :to="`/list/${listId}/settings`">
                <template #prepend>
                    <v-icon icon="mdi-cog" />
                </template>
                <v-list-item-title>
                    List Settings
                </v-list-item-title>
            </v-list-item>
            <v-list-item @click.stop="deleteList">
                <template #prepend>
                    <v-icon
                        color="red"
                        icon="mdi-delete"
                    />
                </template>
                <v-list-item-title
                    data-test-id="delete-list"
                    class="text-red"
                >
                    Delete List
                </v-list-item-title>
            </v-list-item>
        </v-list>
    </v-menu>
</template>
