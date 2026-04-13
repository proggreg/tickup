<script setup lang="ts">
import { Button } from '@vuetify/v0';

const store = useListsStore();
const rename = ref(true);
const router = useRoute();
const listNameRef = ref<HTMLInputElement | null>(null);
const listName = computed(() => {
    return store?.currentList?.name || 'Today';
});

const imageGenerating = ref(false);

watch(rename, (newVal: boolean) => {
    if (!newVal) {
        if (!store.currentList.id) {
            store.currentList.id = router.params.id as string;
        }

        store.updateList(store.currentList);
    }
    else {
        if (listNameRef.value) {
            listNameRef.value.focus();
        }
    }
});

watch(listName, (newName: string) => {
    if (!store.currentList.name) return;
    if (store.lists.length && router.params.id && store.currentList.name.length > 0) {
        const list = store.lists.find((list: List) => list.id === store.currentList.id);
        if (list) {
            list.name = newName;
        }
    }
});

function validateListName() {
    if (!listName.value) {
        return 'Please enter a list name';
    }

    return true;
}

async function generateImage() {
    if (!store.currentList.name) {
        console.warn('No list name provided for image generation', { component: 'ListHeader', function: 'generateImage' });
        alert('Please enter a list name');
        return;
    }
    imageGenerating.value = true;

    const response = await $fetch('/api/aws/image', {
        method: 'POST',
        body: {
            prompt: store.currentList.name,
        },
    });
    if (!response) {
        console.warn('Failed to generate image', { component: 'ListHeader', function: 'generateImage', listName: store.currentList.name });
        return;
    }

    store.currentList.image = response;
    store.updateList();

    imageGenerating.value = false;
}

function removeImage() {
    store.currentList.image = '';
    store.updateList();
}
</script>

<template>
    <div class="list-header">
        <div
            class="list-header__card"
            :style="store.currentList.image ? `background-image: url('${store.currentList.image}')` : ''"
        >
            <div :class="['list-header__inner', store.currentList.image ? 'list-header__inner--tint' : '']">
                <div class="list-header__title-row">
                    <input
                        ref="listNameRef"
                        v-model="store.currentList.name"
                        class="list-name-input"
                        :class="store.currentList.image ? 'list-name-input--light' : ''"
                        placeholder="My List"
                        :readonly="!rename"
                        @click="rename = !rename"
                        @keyup.enter="store.currentList.name ? rename = false : null"
                        @blur="store.currentList.name ? rename = false : null"
                    />
                    <ListMenu :list-id="router.params.id as string" />
                </div>

                <div
                    class="list-header__actions"
                    :class="store.currentList.image ? 'list-header__actions--light' : ''"
                >
                    <Button.Root
                        class="icon-btn"
                        :disabled="imageGenerating"
                        aria-label="Generate image"
                        @click="generateImage"
                    >
                        <Button.Icon>
                            <i class="mdi mdi-creation" />
                        </Button.Icon>
                        <Button.Icon>
                            <i class="mdi mdi-image" />
                        </Button.Icon>
                    </Button.Root>

                    <Button.Root
                        v-if="store.currentList.image"
                        class="icon-btn"
                        aria-label="Remove image"
                        @click="removeImage"
                    >
                        <Button.Icon>
                            <i class="mdi mdi-trash-can" />
                        </Button.Icon>
                    </Button.Root>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.list-header {
    width: 100%;
    padding-top: 0;
}

.list-header__card {
    background-size: cover;
    background-position: center;
    border-radius: 0;
    padding: 8px;
}

.list-header__inner {
    padding: 8px;
    border-radius: 4px;
}

.list-header__inner--tint {
    background-color: rgba(0, 0, 0, 0.5);
}

.list-header__title-row {
    display: flex;
    align-items: center;
    gap: 8px;
    overflow: hidden;
}

.list-name-input {
    flex: 1;
    background: transparent;
    border: none;
    outline: none;
    font-size: 1.75rem;
    font-weight: bold;
    text-transform: capitalize;
    color: inherit;
    font-family: inherit;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    cursor: pointer;
    padding: 4px 0;
}

@media (min-width: 600px) {
    .list-name-input {
        font-size: 2.5rem;
    }
}

.list-name-input--light {
    color: #fff;
}

.list-name-input[readonly] {
    cursor: pointer;
}

.list-header__actions {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 4px 0;
}

.list-header__actions--light .icon-btn {
    color: #fff;
}

.icon-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 2px;
    padding: 6px 10px;
    border: none;
    background: transparent;
    cursor: pointer;
    border-radius: 6px;
    color: inherit;
    font-size: 0.8125rem;
    transition: background 0.15s;
}

.icon-btn:hover:not(:disabled) {
    background: rgba(var(--v-border-color), 0.1);
}

.icon-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
}

.icon-btn .mdi {
    font-size: 18px;
}
</style>
