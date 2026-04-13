<script setup lang="ts">
const { smAndDown } = useDisplay();
const isKeyboardOpen = ref(false);

if (import.meta.client) {
    const onViewportResize = () => {
        isKeyboardOpen.value = (window.visualViewport?.height ?? window.innerHeight) < window.innerHeight * 0.75;
    };
    window.visualViewport?.addEventListener('resize', onViewportResize);
    onUnmounted(() => window.visualViewport?.removeEventListener('resize', onViewportResize));
}
</script>

<template>
    <nav
        v-if="smAndDown && !isKeyboardOpen"
        class="mobile-nav"
        role="navigation"
        aria-label="Mobile navigation"
    >
        <NuxtLink
            to="/"
            class="mobile-nav__item"
            active-class="mobile-nav__item--active"
        >
            <i class="mdi mdi-home" />
            <span>Home</span>
        </NuxtLink>

        <NuxtLink
            to="/lists"
            class="mobile-nav__item"
            active-class="mobile-nav__item--active"
        >
            <i class="mdi mdi-format-list-bulleted" />
            <span>Lists</span>
        </NuxtLink>

        <NuxtLink
            to="/search"
            class="mobile-nav__item"
            active-class="mobile-nav__item--active"
        >
            <i class="mdi mdi-magnify" />
            <span>Search</span>
        </NuxtLink>

        <NuxtLink
            to="/settings"
            class="mobile-nav__item"
            active-class="mobile-nav__item--active"
        >
            <i class="mdi mdi-cog" />
            <span>Settings</span>
        </NuxtLink>
    </nav>
</template>

<style scoped>
.mobile-nav {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    display: flex;
    align-items: center;
    justify-content: space-around;
    height: 56px;
    background: rgb(var(--v-theme-surface));
    border-top: 1px solid rgba(var(--v-border-color), 0.12);
    z-index: 100;
}

.mobile-nav__item {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 2px;
    flex: 1;
    height: 100%;
    color: rgba(var(--v-theme-on-surface), 0.6);
    text-decoration: none;
    font-size: 0.6875rem;
    padding: 4px 0;
    transition: color 0.15s;
}

.mobile-nav__item .mdi {
    font-size: 22px;
}

.mobile-nav__item:hover,
.mobile-nav__item--active {
    color: rgb(var(--v-theme-primary));
}
</style>
