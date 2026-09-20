<script setup lang="ts"></script>

<template>
    <NuxtErrorBoundary>
        <template #error="{ error }">
            <v-alert type="error">
                {{ error }}
            </v-alert>
        </template>

        <div class="overflow-y-auto fill-height w-100">
            <AppBreadCrumb />
            <Suspense>
                <TodoDetail />
            </Suspense>
        </div>
    </NuxtErrorBoundary>
</template>
