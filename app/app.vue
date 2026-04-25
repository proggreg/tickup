<script setup lang="ts">
const config = useRuntimeConfig();
const event = useRequestEvent();
const error = useError();
const { show: showNotification, message: notificationMessage, link: notificationLink } = useNotification();

useShortcutKeys();

const showErrorToast = computed(() => !!error.value);
const errorMessage = computed(() => {
    if (!error.value) return '';
    console.error(error.value);

    // Handle Nuxt error object structure
    if (error.value && typeof error.value === 'object') {
        if ('statusMessage' in error.value) {
            return String(error.value.statusMessage);
        }
        if ('message' in error.value) {
            return String(error.value.message);
        }
    }

    return error.value instanceof Error ? error.value.message : String(error.value);
});

function dismissError() {
    clearError();
}

if (import.meta.server && config.public.VERCEL_ENV === 'production' && event?.headers.get('host')
    && !event?.headers.get('host')?.includes('tickup.gregfield.dev')) {
    navigateTo('https://tickup.gregfield.dev/login', { external: true });
}
</script>

<template>
    <div>
        <NuxtPwaManifest />

        <!-- Error toast -->
        <Teleport to="body">
            <Transition name="snackbar">
                <div
                    v-if="showErrorToast"
                    class="snackbar snackbar--error snackbar--top"
                    role="alert"
                >
                    <span class="snackbar__message">{{ errorMessage }}</span>
                    <button
                        class="snackbar__close"
                        @click="dismissError"
                    >
                        Close
                    </button>
                </div>
            </Transition>
        </Teleport>

        <!-- Notification toast -->
        <Teleport to="body">
            <Transition name="snackbar">
                <div
                    v-if="showNotification"
                    class="snackbar snackbar--bottom-right"
                    role="status"
                >
                    <span class="snackbar__message">{{ notificationMessage }}</span>
                    <NuxtLink
                        v-if="notificationLink"
                        :to="notificationLink"
                        class="snackbar__action"
                    >
                        View
                    </NuxtLink>
                </div>
            </Transition>
        </Teleport>

        <TodoDialog />
        <NuxtLayout :name="useAppLayout()">
            <NuxtPage />
        </NuxtLayout>
    </div>
</template>

<style>
/* Design system: The Architectural Ledger (Stitch "App UI Redesign") */
/* Headlines: Manrope — editorial authority */
/* Body/Labels: Inter — functional legibility */
.v-application {
    font-family: 'Inter', sans-serif !important;
}

.v-toolbar-title,
.v-card-title,
.text-h1, .text-h2, .text-h3, .text-h4, .text-h5, .text-h6,
.text-headline, .text-display-1, .text-display-2, .text-display-3, .text-display-4 {
    font-family: 'Manrope', sans-serif !important;
}

* {
    scrollbar-width: none;
}

*::-webkit-scrollbar {
    display: none;
}

[popover] {
    border: none;
    background: transparent;
    padding: 0;
    overflow: visible;
}

.layout-enter-active,
  .layout-leave-active {
    transition: all 0.4s;
  }

  .layout-enter-from,
  .layout-leave-to {
    filter: grayscale(1);
  }

.snackbar {
    position: fixed;
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    border-radius: 8px;
    background: rgb(var(--v-theme-surface));
    border: 1px solid rgba(var(--v-border-color), 0.15);
    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.18);
    font-size: 0.9375rem;
    z-index: 9999;
    max-width: 420px;
}

.snackbar--top {
    top: 16px;
    left: 50%;
    transform: translateX(-50%);
}

.snackbar--bottom-right {
    bottom: 16px;
    right: 16px;
}

.snackbar--error {
    background: rgb(var(--v-theme-error));
    color: #fff;
    border-color: transparent;
}

.snackbar__message {
    flex: 1;
}

.snackbar__close {
    border: none;
    background: transparent;
    color: inherit;
    cursor: pointer;
    font-family: inherit;
    font-size: 0.875rem;
    font-weight: 500;
    padding: 2px 6px;
    border-radius: 4px;
    opacity: 0.85;
}

.snackbar__close:hover {
    opacity: 1;
}

.snackbar__action {
    color: inherit;
    font-size: 0.875rem;
    font-weight: 500;
    text-decoration: none;
    padding: 2px 6px;
    border-radius: 4px;
    opacity: 0.85;
}

.snackbar__action:hover {
    opacity: 1;
}

.snackbar-enter-active,
.snackbar-leave-active {
    transition: opacity 0.25s, transform 0.25s;
}

.snackbar-enter-from,
.snackbar-leave-to {
    opacity: 0;
    transform: translateY(-8px);
}

.snackbar--bottom-right.snackbar-enter-from,
.snackbar--bottom-right.snackbar-leave-to {
    transform: translateY(8px);
}
</style>
