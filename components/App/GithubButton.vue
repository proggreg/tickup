<script setup lang="ts">
const { todoName } = defineProps(['todoName'])
const filteredTodoName = computed(() => todoName.replace(/[\u{1F300}-\u{1F9FF}]|[\u{2700}-\u{27BF}]|[\u{1F000}-\u{1F02F}]|[\u{1F0A0}-\u{1F0FF}]|[\u{1F100}-\u{1F64F}]|[\u{1F680}-\u{1F6FF}]|[\u{1F900}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2B00}-\u{2BFF}]/gu, '').trim())
const githubBranchName = computed(() => {
    let branchName = filteredTodoName.value.replace(/[!@#$%^&*(),.?":{}|<>]/g, '').replace(/ /g, '-').toLowerCase()
    if (branchName.charAt(branchName.length - 1) === '-') {
        branchName = branchName.slice(0, -1)
    }
    return `git checkout -b ${branchName}`
})

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