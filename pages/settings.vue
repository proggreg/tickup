<script setup lang="ts">
const {statuses} = useSettingsStore()
const { data } = useAuth()

console.log('userid', data.value?.user?.sub)

const {data: settings } = await useFetch('/api/settings', {
  query: { userId: data.value?.user?.sub }
})

console.log('user settings', settings.value)
definePageMeta({
    layout: 'settings'
})
const editColour = ref('')
const statusSettings = ref([])

function updateStatusColor(colour: string) {
  editColour.value = ''
}

function toggleEditColour(status: string) {
  if (editColour.value === status) {
    editColour.value = ''
    return

  }
  editColour.value = status
}


function addStatus(newName: string) {
  statuses.value.push({name: newName, color: '#000000'})
}

onMounted(() => {
  console.log('statusSettings', statusSettings.value)
})
</script>
<template>
  <v-row class="fill-height">
    <v-col cols="12">
      <v-card class="fill-height">
        <v-card-title>
          <v-row>
            <v-col cols="10">
              <h2>Settings</h2>
              <v-list>
              <v-list-item v-for="status in statuses" ref="statusSettings" :key="status.name">
                {{ status.name }}
              
              <v-btn min-width="20" 
                    :style="'width: 20px; height: 30px;border-radius: 50%; background-color:' + status.color" 
                    @click="toggleEditColour(status.name)"
              />
              <div v-if="status.name === editColour">
                  <v-color-picker v-model="status.color" 
                    class="ma-4" show-swatches 
                  />
                  <v-list-item-action start>
                    <v-btn @click="editColour = ''">
                      Cancel
                    </v-btn>
                  <v-btn color="primary" @click="updateStatusColor">
                    Save
                  </v-btn>
                </v-list-item-action>
              </div>
            </v-list-item>
              <v-list-item>
                <v-btn @click="addStatus">
                  Add Status
                </v-btn>
              </v-list-item>
              </v-list>
            </v-col>
          </v-row>
        </v-card-title>
        <v-card-text />
      </v-card>
    </v-col>
  </v-row>
</template>