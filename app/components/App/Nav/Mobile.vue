<script setup lang="ts">
const dialog = useDialog();
const route = useRoute();
const isKeyboardOpen = ref(false);

if (import.meta.client) {
    const onViewportResize = () => {
        isKeyboardOpen.value
            = (window.visualViewport?.height ?? window.innerHeight) < window.innerHeight * 0.75;
    };
    window.visualViewport?.addEventListener('resize', onViewportResize);
    onUnmounted(() => window.visualViewport?.removeEventListener('resize', onViewportResize));
}

const leftItems = [
    { key: 'home', label: 'Home', icon: 'mdi-home-outline', iconActive: 'mdi-home', to: '/' },
    {
        key: 'lists',
        label: 'Lists',
        icon: 'mdi-format-list-bulleted',
        iconActive: 'mdi-format-list-checks',
        to: '/lists',
    },
];

const rightItems = [
    {
        key: 'search',
        label: 'Search',
        icon: 'mdi-magnify',
        iconActive: 'mdi-magnify',
        to: '/search',
    },
    {
        key: 'account',
        label: 'Account',
        icon: 'mdi-account-outline',
        iconActive: 'mdi-account',
        to: '/account',
    },
];

function isActive(to: string) {
    return to === '/' ? route.path === '/' : route.path.startsWith(to);
}
</script>

<template>
    <nav
        v-if="!isKeyboardOpen"
        class="mobile-nav"
    >
        <button
            v-for="item in leftItems"
            :key="item.key"
            class="mobile-nav__tab"
            :class="{ 'mobile-nav__tab--active': isActive(item.to) }"
            @click="navigateTo(item.to)"
        >
            <i
                class="mdi mobile-nav__icon"
                :class="isActive(item.to) && item.iconActive ? item.iconActive : item.icon"
            />
            <span class="mobile-nav__label">{{ item.label }}</span>
        </button>

        <!-- Raised FAB -->
        <div class="mobile-nav__fab-wrap">
            <button
                class="mobile-nav__fab"
                data-testid="mobile-new-todo-fab"
                @click="
                    dialog.page = 'todo';
                    dialog.open = true;
                "
            >
                <i
                    class="mdi mdi-plus"
                    style="font-size: 26px"
                />
            </button>
        </div>

        <button
            v-for="item in rightItems"
            :key="item.key"
            class="mobile-nav__tab"
            :class="{ 'mobile-nav__tab--active': isActive(item.to) }"
            @click="navigateTo(item.to)"
        >
            <i
                class="mdi mobile-nav__icon"
                :class="isActive(item.to) && item.iconActive ? item.iconActive : item.icon"
            />
            <span class="mobile-nav__label">{{ item.label }}</span>
        </button>
    </nav>
</template>

<style scoped>
.mobile-nav {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    height: 64px;
    background: #ffffff;
    border-top: 1px solid rgba(113, 124, 130, 0.16);
    display: flex;
    align-items: stretch;
    padding-bottom: env(safe-area-inset-bottom, 0px);
    z-index: 100;
    /* allow FAB to overflow above */
    overflow: visible;
}

.mobile-nav__tab {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 3px;
    border: none;
    background: transparent;
    cursor: pointer;
    color: rgba(42, 52, 57, 0.45);
    padding: 8px 4px;
    transition: color 0.1s;
}
.mobile-nav__tab--active {
    color: #005ac2;
}

.mobile-nav__icon {
    font-size: 22px;
}

.mobile-nav__label {
    font-size: 0.6875rem;
    font-weight: 500;
    line-height: 1;
}

/* FAB slot */
.mobile-nav__fab-wrap {
    flex: 1;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
}

.mobile-nav__fab {
    position: absolute;
    bottom: 10px;
    width: 52px;
    height: 52px;
    border-radius: 50%;
    background: #005ac2;
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #ffffff;
    cursor: pointer;
    box-shadow:
        0 4px 16px rgba(0, 90, 194, 0.36),
        0 2px 6px rgba(0, 90, 194, 0.2);
    transition:
        opacity 0.1s,
        transform 0.1s;
}
.mobile-nav__fab:hover {
    opacity: 0.92;
}
.mobile-nav__fab:active {
    transform: scale(0.95);
}
</style>
