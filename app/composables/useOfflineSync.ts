// composables/useOfflineSync.ts
interface OfflineStatus {
    isOnline: boolean;
    isSyncing: boolean;
    pendingCount: number;
    lastSync: number | null;
    hasFailedChanges: boolean;
}

export const useOfflineSync = () => {
    const offlineSync = useOfflineSyncStore();

    const getOfflineStatus = computed((): OfflineStatus => {
        const pending = offlineSync.pendingChanges.filter(c => !c.synced);

        return {
            isOnline: offlineSync.isOnline,
            isSyncing: offlineSync.isSyncing,
            pendingCount: pending.length,
            lastSync: offlineSync.lastSyncTime,
            hasFailedChanges: pending.some(c => (c.retryCount || 0) > 2),
        };
    });

    const syncNow = async (): Promise<void> => {
        await offlineSync.syncPendingChanges();
    };

    return {
        ...toRefs(getOfflineStatus.value),
        syncNow,
        pendingChanges: offlineSync.pendingChanges,
    };
};
