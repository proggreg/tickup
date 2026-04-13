<script setup lang="ts">
import { Button, Input } from '@vuetify/v0';
import { connect } from './helpers';

const url = ref('https://mcp.clickup.com/mcp');

function connectMCPServer() {
    console.log('Connect to MCP Server: ', url.value);
    try {
        connect(url.value);
    }
    catch (err) {
        alert(JSON.stringify(err));
    }
}
</script>

<template>
    <div class="mcp-client">
        <Input.Root v-model="url" label="MCP Server URL">
            <Input.Control class="input-control" />
        </Input.Root>
        <Button.Root
            class="btn btn--primary"
            @click="connectMCPServer"
        >
            <Button.Content>connect</Button.Content>
        </Button.Root>
    </div>
</template>

<style scoped>
.mcp-client {
    display: flex;
    gap: 8px;
    align-items: flex-start;
}

.input-control {
    width: 100%;
    padding: 8px 12px;
    border: 1px solid rgba(var(--v-border-color), 0.38);
    border-radius: 4px;
    background: transparent;
    color: rgb(var(--v-theme-on-surface));
    font-size: 1rem;
    outline: none;
}

.input-control:focus {
    border-color: rgb(var(--v-theme-primary));
}

.btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 8px 16px;
    border: none;
    background: transparent;
    cursor: pointer;
    border-radius: 4px;
    font-size: 0.875rem;
    font-weight: 500;
    color: inherit;
    white-space: nowrap;
}

.btn--primary {
    background: rgb(var(--v-theme-primary));
    color: rgb(var(--v-theme-on-primary));
}

.btn--primary:hover {
    opacity: 0.9;
}
</style>
