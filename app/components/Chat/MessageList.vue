<script setup lang="ts">
import { Button } from '@vuetify/v0';
import type { UIMessage } from 'ai';
import { isToolUIPart } from 'ai';

interface Props {
    messages: UIMessage[];
    loading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    loading: false,
});

const colorMode = useColorMode();

const scrollContainer = ref<HTMLElement | null>(null);
const isAtBottom = ref(true);
const SCROLL_THRESHOLD = 60;

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

watch(
    () => props.messages,
    () => {
        if (isAtBottom.value) {
            nextTick(() => scrollToBottom());
        }
    },
    { deep: true },
);

onMounted(() => scrollToBottom('instant'));
</script>

<template>
    <div class="chat-message-list-wrapper">
        <div
            ref="scrollContainer"
            class="chat-message-list"
            data-testid="chat-message-list"
            @scroll.passive="onScroll"
        >
            <div
                v-for="(m, index) in messages"
                :key="m.id ?? index"
                class="chat-message"
                :class="m.role === 'user' ? 'chat-message--user' : 'chat-message--assistant'"
                data-testid="chat-message"
            >
                <div
                    v-for="(part, partIndex) in m.parts"
                    :key="`${m.id}-${part.type}-${partIndex}`"
                >
                    <div
                        v-if="part.type === 'text'"
                        class="chat-bubble"
                        :class="m.role === 'user' ? 'chat-bubble--user' : 'chat-bubble--assistant'"
                        data-testid="chat-message-text"
                    >
                        {{ part.text }}
                    </div>

                    <ChatToolCall
                        v-else-if="isToolUIPart(part)"
                        :part="{ ...part }"
                    />
                </div>
            </div>

            <div
                v-if="loading"
                class="chat-message chat-message--assistant"
                data-testid="chat-message-loading"
            >
                <div class="chat-typing">
                    <span />
                    <span />
                    <span />
                </div>
            </div>

            <div class="chat-message-list__anchor" />
        </div>

        <Transition name="fade">
            <Button.Root
                v-if="!isAtBottom"
                class="chat-scroll-btn"
                aria-label="Scroll to bottom"
                data-testid="chat-scroll-to-bottom"
                @click="scrollToBottom()"
            >
                <Button.Icon>
                    <i class="mdi mdi-chevron-down" />
                </Button.Icon>
            </Button.Root>
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
    padding-bottom: 96px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    scroll-behavior: smooth;
}

.chat-message {
    max-width: 80%;
    display: flex;
    flex-direction: column;
}

.chat-message--user {
    align-self: flex-end;
    align-items: flex-end;
}

.chat-message--assistant {
    align-self: flex-start;
    align-items: flex-start;
}

.chat-bubble {
    padding: 8px 12px;
    border-radius: 12px;
    font-size: 0.875rem;
    white-space: pre-wrap;
    word-break: break-word;
    line-height: 1.5;
}

.chat-bubble--user {
    background: rgb(var(--v-theme-primary));
    color: rgb(var(--v-theme-on-primary, 255, 255, 255));
    border-radius: 12px 12px 2px 12px;
}

.chat-bubble--assistant {
    background: rgba(var(--v-border-color), 0.1);
    color: rgb(var(--v-theme-on-surface));
    border-radius: 12px 12px 12px 2px;
}

.chat-typing {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 8px 12px;
    background: rgba(var(--v-border-color), 0.1);
    border-radius: 12px 12px 12px 2px;
}

.chat-typing span {
    display: block;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: rgba(var(--v-theme-on-surface), 0.4);
    animation: typing 1.2s ease-in-out infinite;
}

.chat-typing span:nth-child(2) { animation-delay: 0.2s; }
.chat-typing span:nth-child(3) { animation-delay: 0.4s; }

@keyframes typing {
    0%, 60%, 100% { opacity: 0.4; transform: translateY(0); }
    30% { opacity: 1; transform: translateY(-4px); }
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
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border: none;
    background: rgb(var(--v-theme-primary));
    color: rgb(var(--v-theme-on-primary, 255, 255, 255));
    cursor: pointer;
    border-radius: 50%;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.chat-scroll-btn:hover {
    opacity: 0.9;
}

.chat-scroll-btn .mdi {
    font-size: 18px;
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
