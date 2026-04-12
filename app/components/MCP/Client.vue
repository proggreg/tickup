<script setup lang="ts">
import { connect } from './helpers';

// const client = new MCPClient();
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
    <div>
        <v-text-field v-model="url" />
        <v-btn
            text="connect"
            @click="connectMCPServer"
        />
    </div>
</template>
