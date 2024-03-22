<script setup lang="ts">
const { groupItem, isGroupOpen, columns, toggleGroup, myToggleGroup } = defineProps(
  ['groupItem', 'isGroupOpen', 'columns', 'toggleGroup', 'myToggleGroup'])
const { statuses } = useSettingsStore();

function getStatusColor(todoStatus: string) {
  const status = statuses.filter((status) => status.name === todoStatus);
  if (status.length > 0) {
    return status[0].color;
  }
}

</script>
<template>
   <tr v-if="groupItem.key === 'status'">
      <th :colspan="columns.length">
        <v-btn
          size="small"
          variant="text"
          :icon="isGroupOpen(groupItem) ? '$expand' : '$next'"
          @click="myToggleGroup(toggleGroup, groupItem)"
        />
        <v-btn
          size="x-small"
          :color="getStatusColor(groupItem.value)"
          variant="tonal"
          :text="groupItem.value"
          @click="toggleGroup(groupItem)"
        />
      </th>
  </tr>
</template>