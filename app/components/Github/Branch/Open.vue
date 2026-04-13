<script setup lang="ts">
const listStore = useListsStore();
</script>

<template>
    <a
        v-if="listStore.currentTodo.githubLink"
        class="icon-btn"
        :href="listStore.currentTodo.githubLink"
        target="_blank"
        aria-label="Open branch on GitHub"
    >
        <i class="mdi mdi-open-in-new" />
    </a>
</template>

<style scoped>
.icon-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border: none;
    background: transparent;
    cursor: pointer;
    border-radius: 6px;
    color: inherit;
    padding: 0;
    text-decoration: none;
}

.icon-btn:hover {
    background: rgba(var(--v-border-color), 0.08);
}

.icon-btn .mdi {
    font-size: 16px;
}
</style>
