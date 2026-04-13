<script setup lang="ts">
import { Button, Input } from '@vuetify/v0';
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
    <div class="chat-container">
        <ChatMessageList
            :messages="chat.messages"
            :loading="isLoading"
        />

        <div class="chat-input-wrapper">
            <hr class="divider" />
            <div class="chat-input-bar">
                <form
                    class="chat-input-form"
                    @submit="handleSubmit"
                >
                    <div class="chat-input-row">
                        <ChatModelSelect
                            v-model="selectedModel"
                            class="model-select"
                        />
                        <div class="chat-field-wrap">
                            <Input.Root v-model="input" class="chat-input-root">
                                <Input.Control
                                    class="chat-input-control"
                                    data-testid="chat-input"
                                    placeholder="Say something..."
                                    :disabled="isLoading"
                                    @keydown.enter.exact.prevent="handleSubmit"
                                />
                            </Input.Root>
                            <Button.Root
                                class="send-btn"
                                aria-label="Send message"
                                type="submit"
                                :disabled="isLoading || !input.trim()"
                                @click="handleSubmit"
                            >
                                <Button.Icon>
                                    <i class="mdi mdi-send" />
                                </Button.Icon>
                            </Button.Root>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    </div>
</template>

<style scoped>
.chat-container {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-height: 0;
    overflow: hidden;
    width: 100%;
}

.chat-input-wrapper {
    position: sticky;
    bottom: 0;
    background-color: rgb(var(--v-theme-surface));
    z-index: 5;
    width: 100%;
}

.divider {
    border: none;
    border-top: 1px solid rgba(var(--v-border-color), 0.12);
    margin: 0;
}

.chat-input-bar {
    width: 100%;
    padding: 8px 16px;
}

.chat-input-form,
.chat-input-row {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 12px;
}

.model-select {
    flex-shrink: 0;
    width: 140px;
}

.chat-field-wrap {
    flex: 1;
    min-width: 0;
    display: flex;
    align-items: center;
    border: 1px solid rgba(var(--v-border-color), 0.38);
    border-radius: 4px;
    overflow: hidden;
}

.chat-field-wrap:focus-within {
    border-color: rgb(var(--v-theme-primary));
}

.chat-input-root {
    flex: 1;
}

.chat-input-control {
    width: 100%;
    padding: 8px 12px;
    border: none;
    background: transparent;
    color: inherit;
    font-size: 0.875rem;
    outline: none;
}

.chat-input-control:disabled {
    opacity: 0.6;
}

.send-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border: none;
    background: transparent;
    cursor: pointer;
    border-radius: 0;
    color: inherit;
    padding: 0;
    flex-shrink: 0;
}

.send-btn:hover:not(:disabled) {
    color: rgb(var(--v-theme-primary));
}

.send-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
}

.send-btn .mdi {
    font-size: 18px;
}
</style>
