export const useSettingsStore = defineStore("settings", async () => {
	const darkMode = ref(false);
	const { data, getSession } = useAuth();
	const session = await getSession();
	const userId = session?.user?.sub;
	const userStatuses = ref<Status[]>([]);
	

	const defaultStatuses = [
		{
			name: "Open",
			color: "#87909e",
		},
		{
			name: "In Progress",
			color: "#ee5e99",
		},
		{
			name: "Closed",
			color: "#008844",
		},
	];

	const statuses = computed(() => {
		if (userStatuses.value.length) {
			return userStatuses.value;
		}
		return defaultStatuses;
	});

	async function getUserSettings() {
		// TODO add return type
		const settings = await $fetch<Settings>("/api/settings", { query: { userId } });
		if (settings.statuses.length) {
			userStatuses.value = settings.statuses;
		}
		return true;
	}

	return { darkMode, statuses, getUserSettings, userStatuses };
});
