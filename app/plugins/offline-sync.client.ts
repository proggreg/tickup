// plugins/offline-sync.client.js
export default defineNuxtPlugin(() => {
    const offlineSync = useOfflineSyncStore();

    // Add some debugging
    console.log('Initializing offline sync...');
    console.log('Initial online status:', navigator.onLine);

    // Initialize when app starts
    offlineSync.initializeOnlineStatus();

    // Test the reactivity
    offlineSync.$subscribe((mutation, state) => {
        console.log('Offline store state changed:', mutation.type, state);
    });
});
