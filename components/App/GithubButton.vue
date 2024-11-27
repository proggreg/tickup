<script setup lang="ts">
const { todoName } = defineProps(['todoName'])
const githubBranchName = computed(() => `git checkout -b ${todoName.replace(/ /g, '-').toLowerCase()}`)
const open = ref(false)
const copyToClipBoard = () => {
    if (githubBranchName.value) {
        navigator.clipboard.writeText(githubBranchName.value)
        open.value = true
    }
}
const githubBtn = ref()
</script>

<template>
    <v-menu class="pa-4" min-width="300px">
        <template #activator="{ props }">
            <v-btn v-bind="props" icon="mdi-github" />
        </template>
        <v-list>
            <v-list-item class="d-flex pa-8">
                <v-text-field class="font-weight-bold" ref="githubBtn" @click:append.stop="copyToClipBoard"
                    append-icon="mdi-content-copy" variant="outlined">{{ githubBranchName }}</v-text-field>
                <v-snackbar min-width="10px" absolute attach="githubBtn" location="bottom" location-strategy="connected"
                    contained v-model="open" timeout="2000">Copied
                </v-snackbar>
            </v-list-item>
        </v-list>
    </v-menu>

</template>