<script setup lang="ts">
const isOpen = ref(false)
const message = ref('');
interface Field {
  type: 'string' | 'boolean'
  enum?: string[]
  value: string
}
const properties = reactive<Record<string, Field>>({})

const textFields = computed(() => {
  return Object.fromEntries(
    Object.entries(properties).filter(([, field]) => field.type === 'string')
  )
})

const checkboxFields = computed(() => {
  return Object.fromEntries(
    Object.entries(properties).filter(([, field]) => field.type === 'boolean')
  )
})

interface MCPMessage {
  message: string
  properties: Record<string, Field>
}
const selectionFields = reactive<Record<string, Field>>({})

const { data, open, send, ws } = useWebSocket(`/ws/mcp`, { immediate: false });

function sendResponse(e) {
  e.preventDefault()
  console.log('send')
  const response = Object.fromEntries(
    Object.entries(selectionFields).map(([key, field]) => {
      return [key, field.value]
    })
  )
  send(JSON.stringify(response))
  isOpen.value = false
  message.value = ''
  selectionFields.value = Object.assign({})
}
onMounted(() => {
  open()
})
watch(data, async (newData) => {
  console.log('new data', newData);
  try {
    const parsed = JSON.parse(newData) as MCPMessage

    if (
      parsed &&
      typeof parsed === 'object' &&
      'properties' in parsed &&
      typeof parsed.message === 'string'
    ) {
      isOpen.value = true
      message.value = parsed.message
      // replace reactive objects' contents instead of assigning to .value
      for (const k in properties) delete properties[k]
      Object.assign(properties, parsed.properties)

      const sel = Object.fromEntries(
        Object.entries(parsed.properties).filter(
          ([, field]) => field.type === 'string' && field.enum?.length
        )
      )
      for (const k in selectionFields) delete selectionFields[k]
      Object.assign(selectionFields, sel)
    }
  } catch (err) {
    console.error(err)
  }
});
</script>

<template>
  <div v-if="isOpen">
    <div>{{ message }}</div>
    {{ selectionFields }}
    {{ properties }}
    <v-form @submit="sendResponse">
      <v-text-field v-for="(field, key) in textFields" :label="key"></v-text-field>
      <v-checkbox v-for="(field, key) in checkboxFields" :label="key"></v-checkbox>
      <v-select v-for="(field, key) in selectionFields" :label="key" :items="field.enum" v-model="field.value">

      </v-select>
      <v-btn @click="sendResponse">Accept</v-btn>
    </v-form>
  </div>
</template>
