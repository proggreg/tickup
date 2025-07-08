<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useAuth, useRuntimeConfig } from '#imports'
const listsStore = useListsStore()
const hasGithub = await useHasGithub()

console.log('hasGithub', hasGithub)

const newSubtaskName = ref('')

// Notification control state
const notificationSending = ref(false)
// New: Notification date/time
const notificationDateTime = ref('')

// Push subscription management
const pushSupported = ref(false)
const pushSubscribed = ref(false)
const pushError = ref('')

const { data: authData } = useAuth()
const username = computed(() => {
  if (!authData.value?.user) return ''
  const user = authData.value.user as any
  if (user.username) return user.username
  if (user._doc && user._doc.username) return user._doc.username
  if (user.name) return user.name
  return ''
})

const config = useRuntimeConfig()

onMounted(() => {
  pushSupported.value = 'serviceWorker' in navigator && 'PushManager' in window
  pushSubscribed.value = !!window.localStorage.getItem('push-subscription')
})

async function subscribeToPush() {
  pushError.value = ''
  try {
    if (!('serviceWorker' in navigator)) {
      pushError.value = 'Service workers are not supported.'
      return
    }
    const vapidKey = config.public.VAPID_KEY
    if (!vapidKey) {
      pushError.value = 'VAPID public key is not set. Please set VAPID_PUBLIC_KEY in your .env.'
      return
    }
    const reg = await navigator.serviceWorker.ready
    const sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidKey)
    })
    window.localStorage.setItem('push-subscription', JSON.stringify(sub))
    pushSubscribed.value = true
    if (username.value) {
      await fetch('/api/auth/user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.value, pushSubscription: sub })
      })
    }
  } catch (e) {
    pushError.value = 'Failed to subscribe to push.'
  }
}

async function unsubscribeFromPush() {
  pushError.value = ''
  try {
    const reg = await navigator.serviceWorker.ready
    const sub = await reg.pushManager.getSubscription()
    if (sub) {
      await sub.unsubscribe()
      window.localStorage.removeItem('push-subscription')
      pushSubscribed.value = false
      if (username.value) {
        await fetch('/api/auth/user', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: username.value, pushSubscription: sub })
        })
      }
    }
  } catch (e) {
    pushError.value = 'Failed to unsubscribe.'
  }
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

async function sendPushNotification() {
  notificationSending.value = true
  try {
    // This should be replaced with the user's real push subscription
    const subscription = window.localStorage.getItem('push-subscription')
    if (!subscription) {
      return
    }
    const res = await fetch('/api/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        subscription: JSON.parse(subscription),
        notificationDateTime: notificationDateTime.value,
        username: username.value,
        todoId: listsStore.currentTodo._id
      })
    })
    if (res.ok) {
      // No UI feedback for successful scheduling
    } else {
      // No UI feedback for failed scheduling
    }
  } catch (e) {
    // No UI feedback for error scheduling
  }
  notificationSending.value = false
}

// Send a test push notification for the current todo
async function sendTestPushNotification() {
  const subscription = window.localStorage.getItem('push-subscription')
  if (!subscription) return
  await fetch('/api/subscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      subscription: JSON.parse(subscription),
      username: username.value,
      todoId: listsStore.currentTodo._id
      // No notificationDateTime triggers test notification
    })
  })
}

function updateDueDate(newDate: Date) {
  listsStore.currentTodo.dueDate = newDate
  listsStore.updateTodo(listsStore.currentTodo)
}
function updateName() {
  // TODO add a validation message to say todo names can't be blank
  if (listsStore.currentTodo.name) {
    listsStore.updateTodo(listsStore.currentTodo)
  }
}

function addSubtask() {
  if (!newSubtaskName.value) return
  if (!listsStore.currentTodo.subtasks) listsStore.currentTodo.subtasks = []
  listsStore.currentTodo.subtasks.push({
    name: newSubtaskName.value,
    status: 'open',
    _id: crypto.randomUUID(),
  })
  newSubtaskName.value = ''
  listsStore.updateTodo(listsStore.currentTodo)
}

// Only schedule notification when the date/time field loses focus
function onNotificationDateTimeBlur() {
  if (notificationDateTime.value) {
    sendPushNotification()
  }
}

// Sync notificationDateTime with currentTodo.notificationDateTime on load/change
watch(
  () => listsStore.currentTodo && listsStore.currentTodo._id,
  () => {
    const dt = listsStore.currentTodo?.notificationDateTime
    if (dt) {
      // Format as 'YYYY-MM-DDTHH:mm' for datetime-local input
      const date = new Date(dt)
      const pad = (n: number) => n.toString().padStart(2, '0')
      const formatted = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
      notificationDateTime.value = formatted
    } else {
      notificationDateTime.value = ''
    }
  },
  { immediate: true }
)
</script>

<template>
  <v-card width="100%" elevation="0" class="pa-0 d-flex flex-column rounded-lg">
    <v-card-item class="pb-0 pt-4 px-6 mb-6">
      <v-row align="center">
        <v-col sm="3" md="2" cols="6">
          <TodoStatus />
        </v-col>
        <v-spacer />
        <v-col sm="4" md="4" cols="6">
          <AppDueDate
            :todo-due-date="listsStore.currentTodo.dueDate" :todo="listsStore.currentTodo" :show-detail="true"
            @set-date="updateDueDate"
          />
        </v-col>
      </v-row>
    </v-card-item>
    <v-card-title class="px-6 pt-2 mb-2">
      <v-text-field v-model="listsStore.currentTodo.name" label="Title" hide-details variant="outlined" class="rounded-lg" @blur="updateName" />
    </v-card-title>
    <v-card-item class="px-6 pt-0 pb-2 mb-2">
      <v-textarea
        v-model="listsStore.currentTodo.desc" auto-grow
        class="mt-2 rounded-lg"
        hide-details max-rows="20" variant="outlined"
        @input="listsStore.updateTodo(listsStore.currentTodo)"
        @blur="listsStore.updateTodo(listsStore.currentTodo)"
      />
    </v-card-item>

    <!-- Subtasks Checklist -->
    <v-card-item class="px-6 pt-0 pb-2">
      <div class="pa-4 rounded-lg">
        <div class="mb-2 text-subtitle-1 font-weight-bold">Subtasks</div>
        <v-list density="compact" class="pa-0" v-if="listsStore.currentTodo.subtasks && listsStore.currentTodo.subtasks.length">
          <v-list-item v-for="(subtask, idx) in listsStore.currentTodo.subtasks" :key="subtask._id" class="py-2 px-0 align-center">
            <template #prepend>
              <v-checkbox
                v-model="listsStore.currentTodo.subtasks[idx].status"
                :true-value="'done'"
                :false-value="'open'"
                @change="listsStore.updateTodo(listsStore.currentTodo)"
                class="me-2"
                density="compact"
              />
            </template>
            <v-text-field
              v-model="listsStore.currentTodo.subtasks[idx].name"
              hide-details
              variant="plain"
              :readonly="listsStore.currentTodo.subtasks[idx].status === 'done'"
              :class="{'text-decoration-line-through text-disabled': listsStore.currentTodo.subtasks[idx].status === 'done'}"
              @blur="listsStore.updateTodo(listsStore.currentTodo)"
            />
            <template #append>
              <v-btn icon="mdi-delete" size="small" variant="text" @click="listsStore.currentTodo.subtasks.splice(idx, 1); listsStore.updateTodo(listsStore.currentTodo)" />
            </template>
            <v-divider v-if="idx < listsStore.currentTodo.subtasks.length - 1" class="my-1" />
          </v-list-item>
        </v-list>
        <div v-else class="text-grey text-body-2 pa-2">No subtasks yet. Add one below!</div>
        <div class="d-flex align-center mt-4">
          <v-text-field
            v-model="newSubtaskName"
            label="Add subtask"
            hide-details
            variant="outlined"
            class="me-2 flex-grow-1"
            @keyup.enter="addSubtask"
            style="min-width: 120px;"
          />
          <v-btn icon="mdi-plus" size="small" variant="tonal" color="primary" :disabled="!newSubtaskName" @click="addSubtask" />
        </div>
      </div>
    </v-card-item>
    <!-- End Subtasks Checklist -->

    <v-card-item class="px-6 pt-0 pb-2">
      <TodoLinks />
    </v-card-item>

    <v-card-actions class="py-6 px-6">
      <AppDeleteButton :todo="listsStore.currentTodo" />
      <AppGithubButton v-if="hasGithub" :todo="listsStore.currentTodo" />
      <v-spacer />
      <!-- Push Subscription Management -->
      <div class="d-flex flex-column align-end mr-4">
        <v-alert v-if="pushError" type="error" class="mb-2">{{ pushError }}</v-alert>
        <v-btn v-if="pushSupported && !pushSubscribed" color="primary" @click="subscribeToPush">Subscribe to Push</v-btn>
        <v-btn v-if="pushSupported && pushSubscribed" color="secondary" @click="unsubscribeFromPush">Unsubscribe</v-btn>
      </div>
      <!-- Notification Date/Time Picker: show if push is supported and subscribed -->
      <v-menu v-if="pushSupported && pushSubscribed">
        <template #activator="{ props }">
          <div class="d-flex align-center">
            <v-text-field
              v-bind="props"
              v-model="notificationDateTime"
              label="Notification Date & Time"
              type="datetime-local"
              style="max-width: 220px;"
              class="mr-2"
              @blur="onNotificationDateTimeBlur"
            />
            <v-btn size="small" color="primary" variant="tonal" class="ml-2" @click="sendTestPushNotification">
              Test Notification
            </v-btn>
          </div>
        </template>
        <!-- You can add a custom date-time picker here if you want a more advanced UI -->
      </v-menu>
      <!-- Removed manual Schedule Notification button -->
      <v-file-input label="File input" variant="solo-inverted" density="compact" hide-details disabled class="rounded-lg" />
    </v-card-actions>
  </v-card>
</template>

<style scoped>
.v-file-input {
  flex-grow: 0;
}

:deep(.v-file-input .v-input__control) {
  display: none;
}

.subtask-done-outline {
  border: 2px solid var(--v-theme-primary);
  border-radius: 8px;
  background-color: #f5f5f5;
}
</style>
