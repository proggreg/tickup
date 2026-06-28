<script setup lang="ts"></script>

<template>
    <NuxtErrorBoundary>
        <template #error="{ error }">
            <v-alert type="error">
                {{ error }}
            </v-alert>
        </template>

        <v-row cols="12">
            <AppBreadCrumb />
        </v-row>

        <!-- Main content -->
        <v-row class="todo-page-surface">
            <Transition name="todo-fade">
                <TodoDetail />
            </Transition>
        </v-row>
    </NuxtErrorBoundary>
</template>
