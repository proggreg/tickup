<script setup lang="ts">
import { Button, Dialog, Slider } from '@vuetify/v0';

// TODO settings controls
const cardWidth = ref([50]);
</script>

<template>
    <Dialog.Root>
        <Dialog.Activator>
            <Button.Root
                class="icon-btn"
                aria-label="Settings"
            >
                <Button.Icon>
                    <i class="mdi mdi-cog" />
                </Button.Icon>
            </Button.Root>
        </Dialog.Activator>

        <Dialog.Content class="settings-dialog">
            <Dialog.Title class="settings-dialog__title">
                Settings
            </Dialog.Title>
            <div class="settings-dialog__body">
                <label class="settings-label">Card Width</label>
                <Slider.Root
                    v-model="cardWidth"
                    class="settings-slider"
                    :min="0"
                    :max="100"
                >
                    <Slider.Track class="slider-track">
                        <Slider.Range class="slider-range" />
                    </Slider.Track>
                    <Slider.Thumb class="slider-thumb" />
                </Slider.Root>
            </div>
            <div class="settings-dialog__actions">
                <Dialog.Close>
                    <Button.Root class="btn">
                        <Button.Content>Close</Button.Content>
                    </Button.Root>
                </Dialog.Close>
            </div>
        </Dialog.Content>
    </Dialog.Root>
</template>

<style scoped>
.icon-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border: none;
    background: transparent;
    cursor: pointer;
    border-radius: 8px;
    color: inherit;
    padding: 0;
}

.icon-btn:hover {
    background: rgba(var(--v-border-color), 0.08);
}

.icon-btn .mdi {
    font-size: 20px;
}

.settings-dialog {
    background: rgb(var(--v-theme-surface));
    color: rgb(var(--v-theme-on-surface));
    border: none;
    border-radius: 12px;
    padding: 24px;
    width: 400px;
    max-width: 90vw;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.24);
}

.settings-dialog::backdrop {
    background: rgba(0, 0, 0, 0.5);
}

.settings-dialog__title {
    font-size: 1.125rem;
    font-weight: 500;
    margin: 0 0 20px;
}

.settings-dialog__body {
    margin-bottom: 24px;
}

.settings-label {
    display: block;
    font-size: 0.875rem;
    margin-bottom: 12px;
    color: rgba(var(--v-theme-on-surface), 0.7);
}

.settings-slider {
    position: relative;
    display: flex;
    align-items: center;
    height: 20px;
    user-select: none;
}

.slider-track {
    position: relative;
    flex: 1;
    height: 4px;
    background: rgba(var(--v-border-color), 0.24);
    border-radius: 2px;
    cursor: pointer;
}

.slider-range {
    position: absolute;
    left: 0;
    height: 100%;
    background: rgb(var(--v-theme-primary));
    border-radius: 2px;
}

.slider-thumb {
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: rgb(var(--v-theme-primary));
    border: 2px solid rgb(var(--v-theme-surface));
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
    cursor: grab;
    position: absolute;
    transform: translateX(-50%);
}

.slider-thumb:focus-visible {
    outline: 2px solid rgb(var(--v-theme-primary));
    outline-offset: 2px;
}

.settings-dialog__actions {
    display: flex;
    justify-content: flex-end;
}

.btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 6px 16px;
    border: none;
    background: transparent;
    cursor: pointer;
    border-radius: 8px;
    font-size: 0.875rem;
    font-weight: 500;
    color: inherit;
}

.btn:hover {
    background: rgba(var(--v-border-color), 0.08);
}
</style>
