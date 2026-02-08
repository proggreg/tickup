<script setup lang="ts">
const listTypeOptions = ref<ListType[]>(['table', 'simple']);
const props = defineProps<{ currentListType?: ListType }>();
const selectedType = ref<ListType>(props.currentListType && props.currentListType !== '' ? props.currentListType : 'simple');
const emit = defineEmits<{
    listTypeUpdated: [listType: ListType];
}>();

// Watch for prop changes to update selectedType
watch(() => props.currentListType, (newVal) => {
    const validValue = newVal && newVal !== '' ? newVal : 'simple';
    if (validValue !== selectedType.value) {
        selectedType.value = validValue;
    }
}, { immediate: true });

// Watch for selectedType changes to emit updates
watch(selectedType, (newVal: ListType, oldVal: ListType) => {
    if (newVal !== oldVal) {
        emit('listTypeUpdated', newVal);
    }
});
</script>

<template>
    <v-select
        v-model="selectedType"
        :items="listTypeOptions"
        single-line
        min-width="60"
        max-width="150"
        variant="outlined"

        flat
        elevation="0"
        data-testid="list-type-select"
    />
</template>

<style scoped>
  :deep(.v-field__input) {
    padding: 0.75em;
    min-height: 0;
    height: 100%;
    /* max-height: 48px; */
  }
</style>
