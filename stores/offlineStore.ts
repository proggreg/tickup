export const useOfflineSyncStore = defineStore('offlineSync', () => {
  const pendingChanges = ref<PendingChange[]>([])
  const isOnline = ref<boolean>(true)
  const isSyncing = ref<boolean>(false)
  const lastSyncTime = ref<number | null>(null)

  const initializeOnlineStatus = (): void => {
    if (import.meta.client) {
      isOnline.value = navigator.onLine

      window.addEventListener('online', handleOnline)
      window.addEventListener('offline', handleOffline)
    }
  }

  const handleOnline = async (): Promise<void> => {
    isOnline.value = true
    await syncPendingChanges()
  }

  const handleOffline = (): void => {
    isOnline.value = false
  }

  const addPendingChange = (change: Omit<PendingChange, 'id' | 'timestamp' | 'synced' | 'retryCount'>): void => {
    const newChange: PendingChange = {
      id: Date.now() + Math.random(),
      ...change,
      timestamp: Date.now(),
      synced: false,
      retryCount: 0,
    }

    pendingChanges.value.push(newChange)
  }

  const syncPendingChanges = async (): Promise<void> => {
    if (!isOnline.value || isSyncing.value || pendingChanges.value.length === 0) {
      return
    }

    isSyncing.value = true
    const unsyncedChanges = pendingChanges.value.filter(c => !c.synced)

    for (const change of unsyncedChanges) {
      try {
        await syncSingleChange(change)
        markChangeSynced(change.id)
      }
 catch (error) {
        logger.error(error as Error, { component: 'OfflineSyncStore', function: 'syncPendingChanges', changeId: change.id })
        incrementRetryCount(change.id)
      }
    }

    lastSyncTime.value = Date.now()
    isSyncing.value = false
  }

  const syncSingleChange = async (change: PendingChange): Promise<any> => {
    return await $fetch(change.endpoint, {
      method: change.method as any,
      body: change.data,
    })
  }

  const markChangeSynced = (changeId: string | number): void => {
    const change = pendingChanges.value.find(c => c.id === changeId)
    if (change) {
      change.synced = true
      change.syncedAt = Date.now()
    }
  }

  const incrementRetryCount = (changeId: string | number): void => {
    const change = pendingChanges.value.find(c => c.id === changeId)
    if (change) {
      change.retryCount = (change.retryCount || 0) + 1
    }
  }

  const removePendingChange = (changeId: string | number): void => {
    const index = pendingChanges.value.findIndex(c => c.id === changeId)
    if (index !== -1) {
      pendingChanges.value.splice(index, 1)
    }
  }

  const clearSyncedChanges = (): void => {
    pendingChanges.value = pendingChanges.value.filter(c => !c.synced)
  }

  return {
    pendingChanges: readonly(pendingChanges),
    isOnline: readonly(isOnline),
    isSyncing: readonly(isSyncing),
    lastSyncTime: readonly(lastSyncTime),
    initializeOnlineStatus,
    addPendingChange,
    syncPendingChanges,
    removePendingChange,
    clearSyncedChanges,
  }
}, {
  // persist: {
  //   pick: ['pendingChanges', 'lastSyncTime'],
  // },
})
