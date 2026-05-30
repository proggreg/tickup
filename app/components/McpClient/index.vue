<script setup lang="ts">
import { Client } from '@modelcontextprotocol/sdk/client/index';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp';
import { ElicitRequestSchema } from '@modelcontextprotocol/sdk/types';

const transport = new StreamableHTTPClientTransport(new URL(location.origin + '/mcp'));
const mcpClient = new Client(
    { name: 'tickup-client', version: '0.0.1' },
    { capabilities: { elicitation: {} } },
);

const toolList = ref<{ name: string; description?: string }[]>([]);
const userText = ref('');
const reply = ref('');
const loading = ref(false);
const { notify } = useNotification();

// Elicitation dialog state
const elicitDialog = ref(false);
const elicitMessage = ref('');
const elicitFields = ref<{ name: string; label: string; type: string; enum?: string[] }[]>([]);
const elicitValues = ref<Record<string, string | boolean>>({});
type ElicitResolve = (value: { action: 'accept' | 'decline' | 'cancel'; content?: Record<string, string | boolean> }) => void;
const elicitResolve = ref<ElicitResolve | null>(null);

function openElicitDialog(message: string, fields: typeof elicitFields.value): Promise<{ action: 'accept' | 'decline' | 'cancel'; content?: Record<string, string | boolean> }> {
    elicitMessage.value = message;
    elicitFields.value = fields;
    elicitValues.value = {};
    elicitDialog.value = true;
    return new Promise((resolve) => {
        elicitResolve.value = resolve;
    });
}

function elicitAccept() {
    elicitDialog.value = false;
    elicitResolve.value?.({ action: 'accept', content: { ...elicitValues.value } });
    elicitResolve.value = null;
}

function elicitDecline() {
    elicitDialog.value = false;
    elicitResolve.value?.({ action: 'decline' });
    elicitResolve.value = null;
}

function elicitCancel() {
    elicitDialog.value = false;
    elicitResolve.value?.({ action: 'cancel' });
    elicitResolve.value = null;
}

onMounted(async () => {
    mcpClient.setRequestHandler(ElicitRequestSchema, async (request) => {
        const params = request.params;
        const properties = params.requestedSchema?.properties ?? {};

        const fields = Object.entries(properties).map(([name, schema]: [string, any]) => ({
            name,
            label: schema.title ?? name,
            type: schema.type === 'boolean' ? 'boolean' : schema.enum ? 'enum' : 'text',
            enum: schema.enum as string[] | undefined,
        }));

        return await openElicitDialog(params.message, fields);
    });

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
        <v-text-field
            v-model="userText"
            label="Ask something"
            @keydown.enter="send"
        />
        <v-btn
            :loading="loading"
            @click="send"
        >
            Send
        </v-btn>

        <v-card
            v-if="reply"
            class="mt-4 pa-4"
        >
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

        <!-- Elicitation dialog -->
        <v-dialog
            v-model="elicitDialog"
            max-width="480"
            persistent
        >
            <v-card>
                <v-card-title>Confirmation required</v-card-title>
                <v-card-text>
                    <p class="mb-4">
                        {{ elicitMessage }}
                    </p>
                    <template
                        v-for="field in elicitFields"
                        :key="field.name"
                    >
                        <v-select
                            v-if="field.type === 'enum'"
                            v-model="elicitValues[field.name]"
                            :label="field.label"
                            :items="field.enum"
                            class="mb-2"
                        />
                        <v-checkbox
                            v-else-if="field.type === 'boolean'"
                            v-model="elicitValues[field.name]"
                            :label="field.label"
                            class="mb-2"
                        />
                        <v-text-field
                            v-else
                            v-model="elicitValues[field.name]"
                            :label="field.label"
                            class="mb-2"
                        />
                    </template>
                </v-card-text>
                <v-card-actions>
                    <v-btn @click="elicitCancel">
                        Cancel
                    </v-btn>
                    <v-spacer />
                    <v-btn @click="elicitDecline">
                        No
                    </v-btn>
                    <v-btn
                        color="primary"
                        @click="elicitAccept"
                    >
                        Yes
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </v-container>
</template>
