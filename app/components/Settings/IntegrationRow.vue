<script setup lang="ts">
interface Props {
    icon: string;
    name: string;
    description: string;
    shortDescription?: string;
    connected: boolean;
    accountName?: string;
}

defineProps<Props>();
const emit = defineEmits<{ click: [] }>();
</script>

<template>
    <div class="integration-row" @click="emit('click')">
        <div class="integration-row__icon-tile">
            <v-icon :icon="icon" :size="20" color="#2a3439" />
        </div>

        <div class="integration-row__text">
            <div class="integration-row__name-row">
                <span class="integration-row__name">{{ name }}</span>
                <span v-if="connected" class="connected-pill">
                    <span class="connected-pill__dot" />
                    Connected
                </span>
            </div>
            <div class="integration-row__description">
                <template v-if="connected && accountName"> {{ accountName }} · </template
                >{{ shortDescription || description }}
            </div>
        </div>

        <div class="integration-row__action">
            <v-icon
                v-if="connected"
                icon="mdi-chevron-right"
                :size="18"
                style="color: rgba(42, 52, 57, 0.42)"
            />
            <button v-else class="connect-btn" @click.stop="emit('click')">Connect</button>
        </div>
    </div>
</template>

<style scoped>
.integration-row {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 14px 16px;
    cursor: pointer;
    border-radius: 10px;
    transition: background 0.12s;
}
.integration-row:hover {
    background: rgba(113, 124, 130, 0.07);
}
.integration-row__icon-tile {
    width: 36px;
    height: 36px;
    border-radius: 8px;
    background: var(--color-surface-low, #f0f4f7);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}
.integration-row__text {
    flex: 1;
    min-width: 0;
}
.integration-row__name-row {
    display: flex;
    align-items: center;
    gap: 8px;
}
.integration-row__name {
    font-family: 'Manrope', sans-serif;
    font-size: 15px;
    font-weight: 600;
    color: #2a3439;
}
.integration-row__description {
    font-family: 'Inter', sans-serif;
    font-size: 13px;
    font-weight: 400;
    color: rgba(42, 52, 57, 0.62);
    margin-top: 2px;
}
.connected-pill {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-family: 'Inter', sans-serif;
    font-size: 11px;
    font-weight: 600;
    color: #1a7a4a;
    background: rgba(26, 122, 74, 0.1);
    padding: 2px 8px;
    border-radius: 10px;
}
.connected-pill__dot {
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: #1a7a4a;
    flex-shrink: 0;
}
.integration-row__action {
    flex-shrink: 0;
}
.connect-btn {
    padding: 5px 14px;
    border-radius: 7px;
    border: 1px solid rgba(113, 124, 130, 0.28);
    background: white;
    font-family: 'Inter', sans-serif;
    font-size: 12px;
    font-weight: 600;
    color: #2a3439;
    cursor: pointer;
    transition: background 0.12s;
}
.connect-btn:hover {
    background: rgba(113, 124, 130, 0.07);
}
</style>
