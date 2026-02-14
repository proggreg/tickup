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

const handleSubmit = (e: Event) => {
    e.preventDefault();
    chat.sendMessage({ text: input.value });
    input.value = '';
};
</script>

<template>
    <div>
        <ChatModelSelect
            v-model="selectedModel"
            class="mb-4"
        />

        <div
            v-for="(m, index) in chat.messages"
            :key="m.id ? m.id : index"
            data-testid="chat-message"
        >
            {{ m.role === "user" ? "User: " : "AI: " }}
            <div
                v-for="(part, index) in m.parts"
                :key="`${m.id}-${part.type}-${index}`"
            >
                <div
                    v-if="part.type === 'text'"
                    data-testid="chat-message-text"
                >
                    {{ part.text }}
                </div>
            </div>
        </div>

        <form @submit="handleSubmit">
            <input
                v-model="input"
                data-testid="chat-input"
                placeholder="Say something..."
            >
        </form>
    </div>
</template>
