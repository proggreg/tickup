<script setup lang="ts">
import { Client } from '@modelcontextprotocol/sdk/client/index';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp';

const transport = new StreamableHTTPClientTransport(new URL(location.origin + '/mcp'));
const mcpClient = new Client({ name: 'tickup-client', version: '0.0.1' }, { capabilities: {} });

const toolList = ref<{ name: string; description?: string }[]>([]);
const userText = ref('');
const reply = ref('');
const loading = ref(false);
const { notify } = useNotification();

onMounted(async () => {
    await mcpClient.connect(transport);
    toolList.value = (await mcpClient.listTools()).tools;
});

async function send() {
    loading.value = true;
    try {
        const { text } = await $fetch<{ text: string }>('/api/chat', {
            method: 'POST',
            body: { prompt: userText.value },
        });
        reply.value = text;
    }
    catch (err: any) {
        notify(err?.data?.message ?? err?.message ?? 'Request failed', { timeout: 5000 });
    }
    finally {
        loading.value = false;
    }
}
</script>

<template>
    <v-container>
        <v-text-field v-model="userText" label="Ask something" @keydown.enter="send" />
        <v-btn :loading="loading" @click="send">
            Send
        </v-btn>

        <v-card v-if="reply" class="mt-4 pa-4">
            {{ reply }}
        </v-card>

        <v-list class="mt-4">
            <v-list-subheader>Available tools</v-list-subheader>
            <v-list-item
                v-for="tool in toolList"
                :key="tool.name"
                :title="tool.name"
                :subtitle="tool.description"
            />
        </v-list>
    </v-container>
</template>
