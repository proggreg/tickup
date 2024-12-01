<script setup lang="ts">

import { get } from 'mongoose';
const config = useRuntimeConfig()
const { todo } = defineProps(['todo'])
const { $octokit } = useNuxtApp()
const listStore = useListsStore()

const filteredTodoName = computed(() => todo.name.replace(/[\u{1F300}-\u{1F9FF}]|[\u{2700}-\u{27BF}]|[\u{1F000}-\u{1F02F}]|[\u{1F0A0}-\u{1F0FF}]|[\u{1F100}-\u{1F64F}]|[\u{1F680}-\u{1F6FF}]|[\u{1F900}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2B00}-\u{2BFF}]/gu, '').trim())
const githubBranchName = computed(() => {
    console.log('todo', todo)
    if (todo?.githubBranchName) {
        console.log('todo branch name', todo.githubBranchName)

        return todo.githubBranchName
    }
    let branchName = filteredTodoName.value.replace(/[!@#$%^&*(),.?":{}|<>]/g, '').replace(/ /g, '-').toLowerCase()
    if (branchName.charAt(branchName.length - 1) === '-') {
        branchName = branchName.slice(0, -1)
    }
    return branchName
})

const githubBranchCommand = computed(() => {
    console.log('githubBranchName', todo)
    if (todo.githubBranchName) {
        return `git checkout "${todo.githubBranchName}"`
    }
    return `git checkout -b "${githubBranchName.value}"`
})

const open = ref(false)
const message = ref('')
const hasBranch = ref(false)
const branchURL = ref('')
const copyToClipBoard = () => {
    if (githubBranchName.value) {
        navigator.clipboard.writeText(githubBranchCommand.value)
        message.value = 'Copied to clipboard'
        open.value = true
    }
}
const githubBtn = ref()

const todoBranch = computed(async () => {
    return await getBranch(githubBranchName.value)
})

async function createBranch() {
    console.log('create branch')

    console.log('$octoKit', $octokit)
    if (!config.public.github) {
        console.warn('Github token not found')
        return
    }

    const {
        data: { login },
    } = await $octokit.rest.users.getAuthenticated();

    console.log("Hello, %s", login);
    const sha = await getDevBranchSHA()
    if (!sha) {
        console.error('SHA not found')
        return
    }
    createBranchOnGithub(sha)
    console.log('sha', sha)
    // $octokit.rest.repos.getBranch({
    //     owner: 'gregfield',
    //     repo: 'tickup',
    //     branch: 'develop'
    // }).then(({ data }) => {
    //     console.log(data)
    // }).catch((error) => {
    //     console.log(error)
    // })
}
function createBranchOnGithub(sha: string) {
    $octokit.rest.git.createRef({
        owner: 'proggreg',
        repo: 'tickup',
        ref: `refs/heads/${githubBranchName.value}`,
        sha: sha
    }).then(({ data }) => {
        console.log(data)
        message.value = 'Branch created'
        open.value = true
        getBranch(githubBranchName.value)
        listStore.currentTodo.githubBranchName = githubBranchName.value
        listStore.updateTodo(listStore.currentTodo)
    }).catch((error) => {
        console.log(error)
        message.value = error.message
        open.value = true
    })
}

function getBranch(branchName: string) {
    if (!branchName) {
        return
    }
    return $octokit.rest.repos.getBranch({
        owner: 'proggreg',
        repo: 'tickup',
        branch: branchName
    }).then(({ data }) => {
        console.log('branch', data)
        if (data) {
            console.log('branch url', data?._links?.html)
            branchURL.value = data?._links?.html
            hasBranch.value = true
        }
        return data
    }).catch((error) => {
        console.log(error)
    })
}

function listBranches() {
    $octokit.rest.repos.listBranches({
        owner: 'proggreg',
        repo: 'tickup'
    }).then(({ data }) => {
        console.log(data)
    }).catch((error) => {
        console.log(error)
    })
}

function getDevBranchSHA() {
    return $octokit.rest.repos.getBranch({
        owner: 'proggreg',
        repo: 'tickup',
        branch: 'develop'
    }).then(({ data }) => {
        return data.commit.sha
    }).catch((error) => {
        console.error(error)
    })
}
onUpdated(() => {
    console.log('updated')
    getBranch(githubBranchName.value)
})
</script>

<template>
    <v-menu class="pa-4" min-width="300px" :close-on-content-click="false">
        <template #activator="{ props }">
            <v-btn v-bind="props" icon="mdi-github" />
        </template>
        <v-list>
            <v-list-item class="d-flex pa-8">
                <v-text-field class="font-weight-bold" ref="githubBtn" @click:append.stop="copyToClipBoard"
                    append-icon="mdi-content-copy" variant="outlined">{{ githubBranchCommand }}</v-text-field>
                <v-snackbar min-width="10px" attach="githubBtn" location="end center" location-strategy="connected"
                    contained v-model="open" timeout="2000">{{ message }}
                </v-snackbar>
            </v-list-item>
            <v-list-item>
                <v-btn v-if="!branchURL" color="primary" variant="tonal" @click.stop="createBranch">
                    Create Branch
                </v-btn>
                <v-btn v-else class="font-weight-bold" :href="branchURL" target="_blank">View Branch</v-btn>
                <!-- <v-text-field v-if="githubBranchName" v-model="githubBranchName" label="Branch Name" outlined
                    readonly /> -->
            </v-list-item>
        </v-list>
    </v-menu>

</template>