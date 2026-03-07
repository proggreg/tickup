<script setup lang="ts">
const store = useSearchStore();
const props = withDefaults(defineProps<{ disableStatusButton?: boolean }>(), {
    disableStatusButton: false,
});
const _emit = defineEmits<{
    'item-click': [item: Todo];
}>();
const { isMobile } = useDevice();
</script>

<template>
    <v-virtual-scroll
        :items="store.results"
        height="100%"
        item-height="50"
    >
        <template #default="{ item }">
            <v-list-item
                link
                :to="`/todo/${item.id}`"
                class="py-2"
            >
                <v-row
                    no-gutters
                    class="mb-2"
                >
                    <v-col
                        class="mr-2"
                        cols="auto"
                    >
                        <ListStatus
                            :todo="item"
                            :disabled="props.disableStatusButton"
                        />
                    </v-col>
                    <v-col>
                        <span class="font-weight-bold">{{ item.name }}</span>
                        <br>
                        {{ new Date(item.updatedAt).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit' }) }}
                        {{ new Date(item.updatedAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) }}
                    </v-col>
                </v-row>

                <template #append>
                    <v-btn
                        v-if="!isMobile"
                        :to="`/todo/${item.id}`"
                        icon="mdi-open-in-new"
                        variant="text"
                    />
                </template>
            </v-list-item>
        </template>
    </v-virtual-scroll>
</template>
