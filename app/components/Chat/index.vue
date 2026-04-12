<script setup lang="ts">
import { Chat } from '@ai-sdk/vue';
import { DefaultChatTransport } from 'ai';

const input = ref('');
const selectedModel = useState('selectedModel', () => '');

const chat = new Chat({
    transport: new DefaultChatTransport({
        api: '/api/chat',
        body: () => ({ model: selectedModel.value }),
    }),
});

const isLoading = computed(() => chat.status === 'streaming' || chat.status === 'submitted');

const handleSubmit = (e: Event) => {
    e.preventDefault();
    if (!input.value.trim() || isLoading.value) return;
    chat.sendMessage({ text: input.value });
    input.value = '';
};
</script>

<template>
    <v-card
        width="100%"
        class="chat-container"
        variant="flat"
    >
        <!-- Scrollable message list -->
        <ChatMessageList
            :messages="chat.messages"
            :loading="isLoading"
        />

        <!-- Fixed / sticky input bar at the bottom -->
        <div class="chat-input-wrapper">
            <v-divider />

            <v-card-item class="chat-input-bar">
                <form
                    class="chat-input-form"
                    @submit="handleSubmit"
                >
                    <div class="chat-input-row d-flex align-center ga-3 py-2">
                        <ChatModelSelect
                            v-model="selectedModel"
                            class="flex-shrink-0"
                            style="width: 140px;"
                        />
                        <v-text-field
                            v-model="input"
                            :disabled="isLoading"
                            class="chat-input-field"
                            data-testid="chat-input"
                            placeholder="Say something..."
                            variant="outlined"
                            density="compact"
                            hide-details
                            append-inner-icon="mdi-send"
                            @click:append-inner="handleSubmit"
                            @keydown.enter.exact.prevent="handleSubmit"
                        />
                    </div>
                </form>
            </v-card-item>
        </div>
    </v-card>
</template>

<style scoped>
.chat-container {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-height: 0;
    overflow: hidden;
}

.chat-input-wrapper {
    position: sticky;
    bottom: 0;
    background-color: rgb(var(--v-theme-surface));
    z-index: 5;
    width: 100%;
}

.chat-input-bar,
.chat-input-form,
.chat-input-row {
    width: 100%;
}

.chat-input-field {
    flex: 1;
    min-width: 0;
}

:deep(.chat-input-bar .v-card-item__content) {
    width: 100%;
}
</style>
