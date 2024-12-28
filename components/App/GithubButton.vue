<script setup lang="ts">
const config = useRuntimeConfig()
const { todo } = defineProps<{ todo: Todo }>()
const { $octokit } = useNuxtApp()
const listStore = useListsStore()

const filteredTodoName = computed(() => todo.name.replace(/[\u{1F300}-\u{1F9FF}]|[\u{2700}-\u{27BF}]|[\u{1F000}-\u{1F02F}]|[\u{1F0A0}-\u{1F0FF}]|[\u{1F100}-\u{1F64F}]|[\u{1F680}-\u{1F6FF}]|[\u{1F900}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2B00}-\u{2BFF}]/gu, '').trim())
const githubBranchName = computed(() => {
  if (todo?.githubBranchName) {
    return todo.githubBranchName
  }
  let branchName = filteredTodoName.value.replace(/[!@#$%^&*(),.?":{}|<>]/g, '').replace(/ /g, '-').toLowerCase()
  if (branchName.charAt(branchName.length - 1) === '-') {
    branchName = branchName.slice(0, -1)
  }
  return branchName
})

const githubBranchCommand = computed(() => {
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
    if (!branchURL.value) {
      updateBranchName()
    }

    open.value = true
  }
}
const githubBtn = ref()

async function createBranch() {
  if (!config.public.github) {
    console.warn('Github token not found')
    return
  }

  const sha = await getDevBranchSHA()
  if (!sha) {
    console.error('SHA not found')
    return
  }
  createBranchOnGithub(sha)
}
function createBranchOnGithub(sha: string) {
  $octokit.rest.git.createRef({
    owner: 'proggreg',
    repo: 'tickup',
    ref: `refs/heads/${githubBranchName.value}`,
    sha: sha,
  }).then(() => {
    message.value = 'Branch created'
    open.value = true
    getBranch(githubBranchName.value)
    listStore.currentTodo.githubBranchName = githubBranchName.value
    listStore.updateTodo(listStore.currentTodo)
  }).catch((error) => {
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
    branch: branchName,
  }).then(({ data }) => {
    if (data) {
      branchURL.value = data?._links?.html
      hasBranch.value = true
    }
    return data
  }).catch((error) => {
    console.log(error)
  })
}

function getDevBranchSHA() {
  return $octokit.rest.repos.getBranch({
    owner: 'proggreg',
    repo: 'tickup',
    branch: 'main',
  }).then(({ data }) => {
    return data.commit.sha
  }).catch((error) => {
    console.error(error)
  })
}
onUpdated(() => {
  getBranch(githubBranchName.value)
})

function updateBranchName() {
  listStore.currentTodo.githubBranchName = githubBranchName.value
  listStore.updateTodo(listStore.currentTodo)
}
onMounted(async () => {
  const hasBranch = await getBranch(githubBranchName.value)
  if (hasBranch && !todo.githubBranchName) {
    updateBranchName()
  }
})
</script>

<template>
  <v-menu class="pa-4" min-width="300px" :close-on-content-click="false">
    <template #activator="{ props }">
      <v-btn v-bind="props" icon="mdi-github" />
    </template>
    <v-list>
      <v-list-item class="d-flex pa-8">
        <v-text-field

          ref="githubBtn" class="font-weight-bold" append-icon="mdi-content-copy"
          variant="outlined" @click:append.stop="copyToClipBoard"
        >
          {{ githubBranchCommand }}
        </v-text-field>

        <p class="px-4 py-2 font-weight-bold">
          Branch Name: {{ todo.githubBranchName }}
        </p>
        <v-snackbar
          v-model="open" min-width="10px" attach="githubBtn" location="end center"
          location-strategy="connected" contained timeout="2000"
        >
          {{ message }}
        </v-snackbar>
      </v-list-item>
      <v-list-item>
        <v-btn v-if="!branchURL" color="primary" variant="tonal" @click.stop="createBranch">
          Create Branch
        </v-btn>
        <v-btn v-else class="font-weight-bold" :href="branchURL" target="_blank">View Branch</v-btn>
      </v-list-item>
    </v-list>
  </v-menu>
</template>
