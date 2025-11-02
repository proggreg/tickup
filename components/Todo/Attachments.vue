<script setup lang="ts">
import { ref, computed } from 'vue'

const listsStore = useListsStore()

const fileInput = ref<HTMLInputElement>()
const uploading = ref(false)
const uploadError = ref('')
const selectedFile = ref<File | null>(null)

const attachments = computed(() => listsStore.currentTodo.attachments || [])

const allowedTypes = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain',
  'text/csv',
]

const maxFileSize = 10 * 1024 * 1024 // 10MB

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

function getFileIcon(mimeType: string): string {
  if (mimeType.startsWith('image/')) return 'mdi-image'
  if (mimeType === 'application/pdf') return 'mdi-file-pdf-box'
  if (mimeType.includes('word')) return 'mdi-file-word-box'
  if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return 'mdi-file-excel-box'
  if (mimeType.startsWith('text/')) return 'mdi-file-document'
  return 'mdi-file'
}

async function handleFileUpload(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  if (!file) return

  // Validate file size
  if (file.size > maxFileSize) {
    uploadError.value = 'File size must be less than 10MB'
    return
  }

  // Validate file type
  if (!allowedTypes.includes(file.type)) {
    uploadError.value = 'File type not allowed'
    return
  }

  uploading.value = true
  uploadError.value = ''

  try {
    const formData = new FormData()
    formData.append('file', file)
    if (listsStore.currentTodo._id) {
      formData.append('todoId', listsStore.currentTodo._id)
    }

    const response = await fetch('/api/todo/upload', {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Upload failed')
    }

    const result = await response.json()

    // Update the todo with the new attachment
    if (!listsStore.currentTodo.attachments) {
      listsStore.currentTodo.attachments = []
    }
    listsStore.currentTodo.attachments.push(result.attachment)
    await listsStore.updateTodo(listsStore.currentTodo)

    // Clear the file input
    if (fileInput.value) {
      fileInput.value.value = ''
    }
  }
 catch (error) {
    uploadError.value = error instanceof Error ? error.message : 'Upload failed'
  }
 finally {
    uploading.value = false
  }
}

async function deleteAttachment(attachmentId: string) {
  try {
    const response = await fetch('/api/todo/attachment', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        todoId: listsStore.currentTodo._id,
        attachmentId,
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to delete attachment')
    }

    // Remove attachment from local state
    listsStore.currentTodo.attachments = listsStore.currentTodo.attachments?.filter(
      a => a._id !== attachmentId,
    )
    await listsStore.updateTodo(listsStore.currentTodo)
  }
 catch (error) {
    logger.error(error as Error, { component: 'TodoAttachments', function: 'deleteAttachment' })
  }
}

function openFile(attachment: any) {
  window.open(`/api/attachment/${attachment.attachmentId}`, '_blank')
}
</script>

<template>
  <div class="pa-4 rounded-lg">
    <div class="mb-4 text-subtitle-1 font-weight-bold">Attachments</div>

    <div class="mb-4">
      <v-file-input
        ref="fileInput"
        v-model="selectedFile"
        label="Add attachment"
        accept=".jpg,.jpeg,.png,.gif,.webp,.pdf,.doc,.docx,.xls,.xlsx,.txt,.csv"
        prepend-icon="mdi-paperclip"
        variant="outlined"
        :loading="uploading"
        :error-messages="uploadError"
        hide-details
        class="mb-2"
        @change="handleFileUpload"
      />
      <div class="text-caption text-grey">
        Supported: Images, PDF, Word, Excel, Text files (max 10MB)
      </div>
    </div>

    <div v-if="attachments.length > 0">
      <v-list density="compact" class="pa-0">
        <v-list-item
          v-for="attachment in attachments"
          :key="attachment._id"
          class="py-2 px-0 align-center"
        >
          <template #prepend>
            <v-icon :icon="getFileIcon(attachment.mimeType)" class="me-3" />
          </template>

          <v-list-item-title class="text-body-2">
            {{ attachment.originalName }}
          </v-list-item-title>

          <v-list-item-subtitle class="text-caption">
            {{ formatFileSize(attachment.size) }} •
            {{ new Date(attachment.uploadedAt).toLocaleDateString() }}
          </v-list-item-subtitle>

          <template #append>
            <div class="d-flex align-center">
              <v-btn
                icon="mdi-eye"
                size="small"
                variant="text"
                class="me-1"
                @click="openFile(attachment)"
              />
              <v-btn
                icon="mdi-delete"
                size="small"
                variant="text"
                color="error"
                @click="deleteAttachment(attachment.attachmentId)"
              />
            </div>
          </template>
        </v-list-item>
      </v-list>
    </div>

    <div v-else class="text-grey text-body-2 pa-2">
      No attachments yet. Add files above!
    </div>
  </div>
</template>

<style scoped>
.v-file-input {
  flex-grow: 0;
}

:deep(.v-file-input .v-input__control) {
  display: none;
}
</style>
