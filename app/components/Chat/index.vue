<script setup lang="ts">
import { Chat } from '@ai-sdk/vue';
import { DefaultChatTransport } from 'ai';

const input = ref('');
const selectedModel = useState('selectedModel', () => 'google/gemini-2.0-flash');

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
        class="chat-container d-flex flex-column"
        variant="outlined"
    >
        <!-- Scrollable message list -->
        <ChatMessageList
            :messages="chat.messages"
            :loading="isLoading"
        />

        <v-divider />

        <!-- Input bar -->
        <v-card-item class="py-2">
            <form @submit="handleSubmit">
                <div class="d-flex align-center ga-3">
                    <ChatModelSelect
                        v-model="selectedModel"
                        class="flex-shrink-0"
                        style="width: 140px;"
                    />
                    <v-text-field
                        v-model="input"
                        :disabled="isLoading"
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
    </v-card>
</template>

<style scoped>
.chat-container {
    flex: 1;
    min-height: 0;
    overflow: hidden;
}
</style>
