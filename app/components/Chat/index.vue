<script setup lang="ts">
import { Chat } from '@ai-sdk/vue';

const chat = new Chat();
const input = ref('');

async function handleSubmit(e?: Event) {
    e?.preventDefault();
    const text = input.value.trim();
    if (!text) return;
    input.value = '';
    await chat.sendMessage({ text });
}
</script>

<template>
    <div>
        <div
            v-for="message in chat.messages"
            :key="message.id"
            class="mb-2"
        >
            <p>
                <strong>{{ message.role === 'user' ? 'You' : 'AI' }}:</strong>
                <span
                    v-for="(part, i) in message.parts.filter(p => p.type === 'text')"
                    :key="i"
                >{{ part.text }}</span>
            </p>
        </div>

        <p
            v-if="chat.error"
            class="text-error"
        >
            {{ chat.error.message }}
        </p>

        <form @submit="handleSubmit">
            <v-text-field
                v-model="input"
                placeholder="Type a message..."
                :disabled="chat.status === 'submitted' || chat.status === 'streaming'"
                @keyup.enter="handleSubmit"
            >
                <template #append>
                    <v-btn
                        type="submit"
                        :loading="chat.status === 'submitted' || chat.status === 'streaming'"
                        icon="mdi-send"
                        variant="text"
                    />
                </template>
            </v-text-field>
        </form>
    </div>
</template>

<style scoped></style>
