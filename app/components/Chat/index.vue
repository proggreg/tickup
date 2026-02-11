<script setup lang="ts">
import { useChat } from '@ai-sdk/vue';

const { messages, input, handleSubmit, isLoading, error } = useChat({
    api: '/api/chat',
});
</script>

<template>
    <div>
        <div
            v-for="message in messages"
            :key="message.id"
            class="mb-2"
        >
            <p>
                <strong>{{ message.role === 'user' ? 'You' : 'AI' }}:</strong>
                {{ message.content }}
            </p>
        </div>

        <p
            v-if="error"
            class="text-error"
        >
            {{ error.message }}
        </p>

        <form @submit="handleSubmit">
            <v-text-field
                v-model="input"
                placeholder="Type a message..."
                :disabled="isLoading"
                @keyup.enter="handleSubmit"
            >
                <template #append>
                    <v-btn
                        type="submit"
                        :loading="isLoading"
                        icon="mdi-send"
                        variant="text"
                    />
                </template>
            </v-text-field>
        </form>
    </div>
</template>

<style scoped></style>
