<script setup lang="ts">
const listsStore = useListsStore();
const settingsStore = useSettingsStore();
const hasGithub = await useHasGithub();
const { notify } = useNotification();
const isTriggering = ref(false);

function updateDueDate(newDate: Date) {
    listsStore.currentTodo.dueDate = newDate;
    listsStore.updateTodo(listsStore.currentTodo);
}

function updateName() {
    if (listsStore.currentTodo.name) {
        listsStore.updateTodo(listsStore.currentTodo);
    }
}

async function triggerRoutine() {
    if (!listsStore.currentTodo.id) return;

    settingsStore.loadClaudeRoutineSettings();
    if (!settingsStore.claudeRoutineId || !settingsStore.claudeRoutineApiKey) {
        notify('Claude routine settings not configured. Please update settings first.', {
            timeout: 5000,
        });
        return;
    }

    isTriggering.value = true;
    try {
        await $fetch(`/api/todo/${listsStore.currentTodo.id}/trigger-routine`, {
            method: 'POST',
            body: {
                claudeRoutineId: settingsStore.claudeRoutineId,
                claudeRoutineApiKey: settingsStore.claudeRoutineApiKey,
            },
        });

        notify('Claude routine triggered successfully', { timeout: 3000 });
    } catch (error: any) {
        const message = error?.data?.statusMessage || error?.message || 'Failed to trigger routine';
        notify(message, { timeout: 5000 });
    } finally {
        isTriggering.value = false;
    }
}
</script>

<template>
    <v-card width="100%" elevation="0" class="pa-0 d-flex flex-column rounded-lg todo-detail-card">
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
                    <GithubButton v-if="hasGithub" :todo="listsStore.currentTodo" />
                </v-col>
                <v-col />
                <v-spacer />

                <v-col sm="4" md="4" cols="6">
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
                @input="listsStore.debounceUpdateTodo(listsStore.currentTodo)"
                @blur="listsStore.updateTodo(listsStore.currentTodo)"
            />
        </v-card-item>
        <v-card-item>
            <Subtask />
        </v-card-item>
        <v-card-item>
            <TodoLinks />
        </v-card-item>
        <!-- TODO  add db table and implement API -->
        <!-- <v-card-item>
            <TodoAttachments />
        </v-card-item> -->
        <v-card-actions class="py-6 px-6 d-flex flex-wrap gap-4 align-center justify-space-between">
            <div class="d-flex align-center gap-2 flex-wrap">
                <v-btn
                    size="small"
                    variant="outlined"
                    @click="triggerRoutine"
                    :loading="isTriggering"
                    data-testid="trigger-routine-button"
                >
                    Trigger Claude Routine
                </v-btn>
                <AppDeleteButton :todo="listsStore.currentTodo" />
            </div>
        </v-card-actions>
    </v-card>
</template>

<style scoped>
.todo-detail-card {
    min-height: 360px;
}
</style>
