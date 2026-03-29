<script setup lang="ts">
import type { UIMessage } from 'ai';
import { isToolUIPart } from 'ai';

interface Props {
    messages: UIMessage[];
    loading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    loading: false,
});

const theme = useTheme();

const scrollContainer = ref<HTMLElement | null>(null);
const isAtBottom = ref(true);
const SCROLL_THRESHOLD = 60; // px from bottom to consider "at bottom"

function scrollToBottom(behavior: ScrollBehavior = 'smooth') {
    const el = scrollContainer.value;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior });
}

function onScroll() {
    const el = scrollContainer.value;
    if (!el) return;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    isAtBottom.value = distanceFromBottom <= SCROLL_THRESHOLD;
}

// Auto-scroll when messages change, but only if already at the bottom
watch(
    () => props.messages,
    () => {
        if (isAtBottom.value) {
            nextTick(() => scrollToBottom());
        }
    },
    { deep: true },
);

// Scroll to bottom instantly on first load
onMounted(() => scrollToBottom('instant'));
</script>

<template>
    <div class="chat-message-list-wrapper">
        <!-- Scrollable message area -->
        <div
            ref="scrollContainer"
            class="chat-message-list"
            data-testid="chat-message-list"
            @scroll.passive="onScroll"
        >
            <div
                v-for="(m, index) in messages"
                :key="m.id ?? index"
                class="d-flex flex-column chat-message"
                :class="m.role === 'user' ? 'align-self-end align-items-end' : 'align-self-start align-items-start'"
                data-testid="chat-message"
            >
                <div
                    v-for="(part, partIndex) in m.parts"
                    :key="`${m.id}-${part.type}-${partIndex}`"
                >
                    <v-card
                        v-if="part.type === 'text'"
                        :color="m.role === 'user' ? 'primary' : (theme.current.value.dark ? 'grey-darken-3' : 'surface-variant')"
                        variant="flat"
                        rounded="xl"
                        class="px-3 py-2 text-body-2"
                        style="white-space: pre-wrap; word-break: break-word; line-height: 1.5;"
                        data-testid="chat-message-text"
                    >
                        {{ part.text }}
                    </v-card>

                    <ChatToolCall
                        v-else-if="isToolUIPart(part)"
                        :part="{ ...part }"
                    />
                </div>
            </div>

            <!-- Typing indicator -->
            <div
                v-if="loading"
                class="d-flex flex-column align-self-start align-items-start chat-message"
                data-testid="chat-message-loading"
            >
                <v-progress-linear
                    indeterminate
                    color="primary"
                    height="2"
                    class="mt-1"
                    style="max-width: 80px;"
                />
            </div>

            <!-- Bottom anchor -->
            <div class="chat-message-list__anchor" />
        </div>

        <!-- Scroll to bottom button -->
        <Transition name="fade">
            <v-btn
                v-if="!isAtBottom"
                class="chat-scroll-btn"
                color="primary"
                icon="mdi-chevron-down"
                size="small"
                elevation="4"
                data-testid="chat-scroll-to-bottom"
                @click="scrollToBottom()"
            />
        </Transition>
    </div>
</template>

<style scoped>
.chat-message-list-wrapper {
    position: relative;
    flex: 1;
    min-height: 0;
}

.chat-message-list {
    height: 100%;
    overflow-y: auto;
    padding: 16px;
    padding-bottom: 96px; /* keep last messages visible above the fixed input bar */
    display: flex;
    flex-direction: column;
    gap: 12px;
    scroll-behavior: smooth;
}

.chat-message {
    max-width: 80%;
}

.chat-message-list__anchor {
    height: 1px;
    flex-shrink: 0;
}

.chat-scroll-btn {
    position: absolute;
    bottom: 12px;
    left: 50%;
    transform: translateX(-50%);
}

.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>
