<script setup lang="ts">
const listsStore = useListsStore();
const { isMobile } = useDevice();
const { listId } = defineProps<{
    listId?: string;
}>();

const menu = ref(false);
const menuX = ref(0);
const menuY = ref(0);
const showMenu = ref(false);
const menuTarget = ref(null);

function deleteList() {
    console.log('Delete List');

    listsStore.deleteList(listId);

    let route = '/lists';
    if (!isMobile) {
        route = '/';
    }
    navigateTo(route);
}

async function openMenu(event) {
    event.preventDefault();
    console.log('open menu');
    if (showMenu.value) {
        showMenu.value = false;
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    menuTarget.value = event.target.closest('.v-icon-btn');
    showMenu.value = true;

    menuX.value = event.pageX;
    menuY.value = event.pageY;
    console.log('open menu x', menuX.value);
    console.log('open menu y', menuY.value);
    menu.value = true;
}
</script>

<template>
    <v-btn
        ref="menuTarget"
        class="bg-transparent"
        icon="mdi-dots-vertical"
        :data-testid="`setting-button-${listId}`"
        @click.stop="openMenu"
    />
    <v-menu
        v-model="menu"
        :target="menuTarget"
        location="bottom end"
        bg-color="none"
        @click.stop
    >
        <v-list
            bg-color="none"
            class="bg-transparent"
            @click.stop
        >
            <v-list-item @click.stop="deleteList">
                <v-list-item-title
                    data-test-id="delete-list"
                    class="text-red"
                >
                    Delete List
                </v-list-item-title>
                <template #prepend>
                    <v-icon
                        color="red"
                        icon="mdi-delete"
                    />
                </template>
            </v-list-item>
        </v-list>
    </v-menu>
</template>
