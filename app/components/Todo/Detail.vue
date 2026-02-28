<script setup lang="ts">
const listsStore = useListsStore();
const hasGithub = await useHasGithub();

function updateDueDate(newDate: Date) {
    listsStore.currentTodo.dueDate = newDate;
    listsStore.updateTodo(listsStore.currentTodo);
}
function updateName() {
    if (listsStore.currentTodo.name) {
        listsStore.updateTodo(listsStore.currentTodo);
    }
}
</script>

<template>
    <v-card
        width="100%"
        elevation="0"
        class="pa-0 d-flex flex-column rounded-lg"
    >
        <v-card-title>
            <v-text-field
                v-model="listsStore.currentTodo.name"
                label="Title"
                hide-details
                variant="outlined"
                class="rounded-lg"
                data-testid="todo-detail-title"
                @blur="updateName"
            />
        </v-card-title>
        <v-card-item>
            <v-row align="center">
                <v-col cols="auto">
                    <TodoStatus />
                </v-col>
                <v-col cols="auto">
                    <GithubButton
                        v-if="hasGithub"
                        :todo="listsStore.currentTodo"
                    />
                </v-col>
                <v-col />
                <v-spacer />

                <v-col
                    sm="4"
                    md="4"
                    cols="6"
                >
                    <AppDueDate
                        :todo-due-date="listsStore.currentTodo.dueDate"
                        :todo="listsStore.currentTodo"
                        :show-detail="true"
                        @set-date="updateDueDate"
                    />
                </v-col>
            </v-row>
        </v-card-item>
        <v-card-item>
            <v-textarea
                v-model="listsStore.currentTodo.desc"
                auto-grow
                class="mt-2 rounded-lg"
                hide-details
                max-rows="20"
                variant="outlined"
                @input="listsStore.updateTodo(listsStore.currentTodo)"
                @blur="listsStore.updateTodo(listsStore.currentTodo)"
            />
        </v-card-item>
        <v-card-item v-if="!listsStore.currentTodo.parentId">
            <Subtask />
        </v-card-item>
        <v-card-item>
            <TodoLinks />
        </v-card-item>
        <v-card-item>
            <TodoAttachments />
        </v-card-item>
        <v-card-actions class="py-6 px-6 d-flex flex-wrap gap-4 align-center justify-space-between">
            <div class="d-flex align-center gap-2 flex-wrap">
                <AppDeleteButton :todo="listsStore.currentTodo" />
            </div>
        </v-card-actions>
    </v-card>
</template>
