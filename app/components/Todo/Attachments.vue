<script setup lang="ts">
import { Button } from '@vuetify/v0';
import { ref, computed } from 'vue';

const listsStore = useListsStore();

const fileInput = ref<HTMLInputElement>();
const uploading = ref(false);
const uploadError = ref('');
const selectedFile = ref<File | null>(null);

const attachments = computed(() => listsStore.currentTodo.attachments || []);

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
];

const maxFileSize = 10 * 1024 * 1024;

function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function getFileIcon(mimeType: string): string {
    if (mimeType.startsWith('image/')) return 'mdi-image';
    if (mimeType === 'application/pdf') return 'mdi-file-pdf-box';
    if (mimeType.includes('word')) return 'mdi-file-word-box';
    if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return 'mdi-file-excel-box';
    if (mimeType.startsWith('text/')) return 'mdi-file-document';
    return 'mdi-file';
}

async function handleFileUpload(event: Event) {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];

    if (!file) return;

    if (file.size > maxFileSize) {
        uploadError.value = 'File size must be less than 10MB';
        return;
    }

    if (!allowedTypes.includes(file.type)) {
        uploadError.value = 'File type not allowed';
        return;
    }

    uploading.value = true;
    uploadError.value = '';

    try {
        const formData = new FormData();
        formData.append('file', file);
        if (listsStore.currentTodo.id) {
            formData.append('todoId', listsStore.currentTodo.id);
        }

        const response = await fetch('/api/todo/upload', {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Upload failed');
        }

        const result = await response.json();

        if (!listsStore.currentTodo.attachments) {
            listsStore.currentTodo.attachments = [];
        }
        listsStore.currentTodo.attachments.push(result.attachment);
        await listsStore.updateTodo(listsStore.currentTodo);

        if (fileInput.value) {
            fileInput.value.value = '';
        }
    }
    catch (error) {
        uploadError.value = error instanceof Error ? error.message : 'Upload failed';
    }
    finally {
        uploading.value = false;
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
                todoId: listsStore.currentTodo.id,
                attachmentId,
            }),
        });

        if (!response.ok) {
            throw new Error('Failed to delete attachment');
        }

        listsStore.currentTodo.attachments = listsStore.currentTodo.attachments?.filter(
            a => a.id !== attachmentId,
        );
        await listsStore.updateTodo(listsStore.currentTodo);
    }
    catch (error) {
        console.error(error as Error, { component: 'TodoAttachments', function: 'deleteAttachment' });
    }
}

function openFile(attachment: any) {
    window.open(`/api/attachment/${attachment.attachmentId}`, '_blank');
}
</script>

<template>
    <div class="attachments">
        <div class="attachments__header">
            Attachments
        </div>

        <div class="attachments__upload">
            <label class="file-upload-label">
                <i class="mdi mdi-paperclip" />
                <span>{{ uploading ? 'Uploading...' : 'Add attachment' }}</span>
                <span
                    v-if="uploading"
                    class="spinner spinner--sm"
                />
                <input
                    ref="fileInput"
                    type="file"
                    class="file-input-hidden"
                    accept=".jpg,.jpeg,.png,.gif,.webp,.pdf,.doc,.docx,.xls,.xlsx,.txt,.csv"
                    :disabled="uploading"
                    @change="handleFileUpload"
                />
            </label>
            <div
                v-if="uploadError"
                class="upload-error"
            >
                {{ uploadError }}
            </div>
            <div class="upload-hint">
                Supported: Images, PDF, Word, Excel, Text files (max 10MB)
            </div>
        </div>

        <ul
            v-if="attachments.length > 0"
            class="attachment-list"
        >
            <li
                v-for="attachment in attachments"
                :key="attachment.id"
                class="attachment-item"
            >
                <i
                    :class="`mdi ${getFileIcon(attachment.mimeType)} attachment-item__icon`"
                />
                <div class="attachment-item__info">
                    <span class="attachment-item__name">{{ attachment.originalName }}</span>
                    <span class="attachment-item__meta">
                        {{ formatFileSize(attachment.size) }} •
                        {{ new Date(attachment.uploadedAt).toLocaleDateString() }}
                    </span>
                </div>
                <div class="attachment-item__actions">
                    <Button.Root
                        class="icon-btn"
                        aria-label="View attachment"
                        @click="openFile(attachment)"
                    >
                        <Button.Icon>
                            <i class="mdi mdi-eye" />
                        </Button.Icon>
                    </Button.Root>
                    <Button.Root
                        class="icon-btn icon-btn--danger"
                        aria-label="Delete attachment"
                        @click="deleteAttachment(attachment.attachmentId)"
                    >
                        <Button.Icon>
                            <i class="mdi mdi-delete" />
                        </Button.Icon>
                    </Button.Root>
                </div>
            </li>
        </ul>

        <div
            v-else
            class="attachments__empty"
        >
            No attachments yet. Add files above!
        </div>
    </div>
</template>

<style scoped>
.attachments {
    padding: 16px;
    border-radius: 8px;
}

.attachments__header {
    font-size: 0.875rem;
    font-weight: 700;
    margin-bottom: 12px;
}

.attachments__upload {
    margin-bottom: 16px;
}

.file-upload-label {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 8px 14px;
    border: 1px dashed rgba(var(--v-border-color), 0.38);
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.875rem;
    color: rgba(var(--v-theme-on-surface), 0.7);
    transition: border-color 0.2s, background 0.2s;
    margin-bottom: 6px;
}

.file-upload-label:hover {
    border-color: rgb(var(--v-theme-primary));
    background: rgba(var(--v-theme-primary), 0.04);
    color: rgb(var(--v-theme-primary));
}

.file-input-hidden {
    display: none;
}

.upload-error {
    font-size: 0.75rem;
    color: rgb(var(--v-theme-error));
    margin-bottom: 4px;
}

.upload-hint {
    font-size: 0.75rem;
    color: rgba(var(--v-theme-on-surface), 0.4);
}

.attachment-list {
    list-style: none;
    margin: 0;
    padding: 0;
}

.attachment-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 0;
    border-bottom: 1px solid rgba(var(--v-border-color), 0.06);
}

.attachment-item:last-child {
    border-bottom: none;
}

.attachment-item__icon {
    font-size: 20px;
    color: rgba(var(--v-theme-on-surface), 0.5);
    flex-shrink: 0;
}

.attachment-item__info {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 2px;
}

.attachment-item__name {
    font-size: 0.875rem;
    font-weight: 500;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.attachment-item__meta {
    font-size: 0.75rem;
    color: rgba(var(--v-theme-on-surface), 0.5);
}

.attachment-item__actions {
    display: flex;
    align-items: center;
    gap: 2px;
    flex-shrink: 0;
}

.icon-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border: none;
    background: transparent;
    cursor: pointer;
    border-radius: 6px;
    color: inherit;
    padding: 0;
}

.icon-btn:hover {
    background: rgba(var(--v-border-color), 0.08);
}

.icon-btn--danger .mdi {
    color: rgb(var(--v-theme-error));
}

.icon-btn .mdi {
    font-size: 16px;
}

.attachments__empty {
    font-size: 0.875rem;
    color: rgba(var(--v-theme-on-surface), 0.4);
    padding: 8px 0;
}

.spinner {
    display: inline-block;
    border: 2px solid transparent;
    border-top-color: currentColor;
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
}

.spinner--sm { width: 14px; height: 14px; }

@keyframes spin { to { transform: rotate(360deg); } }
</style>
