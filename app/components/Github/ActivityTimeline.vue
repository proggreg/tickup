<script setup lang="ts">
import type { Repo } from '~/components/Github/RepoSelect.vue';

type EventType = 'commit' | 'pr' | 'branch';

interface ActivityEvent {
    id: string;
    type: EventType;
    summary: string;
    url: string;
    createdAt: string;
}

interface DayGroup {
    label: string;
    events: ActivityEvent[];
}

const props = defineProps<{
    repoName: string;
}>();

const loading = ref(false);
const error = ref('');
const events = ref<ActivityEvent[]>([]);
const repoFullName = ref('');

const iconFor: Record<EventType, string> = {
    commit: 'mdi-source-commit',
    pr: 'mdi-source-pull',
    branch: 'mdi-source-branch',
};

const tintFor: Record<EventType, string> = {
    commit: '#d8e2ff',
    pr: '#d3f5df',
    branch: '#e1e9ee',
};

const iconColorFor: Record<EventType, string> = {
    commit: '#004eaa',
    pr: '#1b8a3d',
    branch: 'rgba(42, 52, 57, 0.6)',
};

function dayLabel(dateStr: string): string {
    const d = new Date(dateStr);
    const now = new Date();
    const startOfDay = (date: Date) =>
        new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const diffDays = Math.round((startOfDay(now).getTime() - startOfDay(d).getTime()) / 86400000);
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

const days = computed<DayGroup[]>(() => {
    const groups: DayGroup[] = [];
    for (const evt of events.value) {
        const label = dayLabel(evt.createdAt);
        let group = groups.find(g => g.label === label);
        if (!group) {
            group = { label, events: [] };
            groups.push(group);
        }
        group.events.push(evt);
    }
    return groups;
});

async function resolveOwner(): Promise<string | null> {
    try {
        const data = await $fetch<{ repositories: Repo[] }>('/api/github/repos');
        const repo = data.repositories.find(r => r.name === props.repoName);
        return repo?.full_name?.split('/').shift() ?? null;
    }
    catch {
        return null;
    }
}

async function load() {
    if (!props.repoName) return;
    loading.value = true;
    error.value = '';
    try {
        const owner = await resolveOwner();
        if (!owner) {
            error.value = 'Could not find repository owner';
            return;
        }
        repoFullName.value = `${owner}/${props.repoName}`;
        const data = await $fetch<{ events: ActivityEvent[] }>('/api/github/activity', {
            query: { owner, repo: props.repoName },
        });
        events.value = data.events;
    }
    catch (e: any) {
        error.value = e?.data?.message || 'Failed to load GitHub activity';
    }
    loading.value = false;
}

onMounted(load);
watch(() => props.repoName, load);
</script>

<template>
    <div class="activity-timeline">
        <div
            v-if="loading"
            class="d-flex align-center justify-center py-8"
        >
            <v-progress-circular
                indeterminate
                size="28"
                color="primary"
            />
        </div>

        <v-alert
            v-else-if="error"
            type="error"
            variant="tonal"
            class="ma-4"
        >
            {{ error }}
        </v-alert>

        <v-empty-state
            v-else-if="!events.length"
            icon="mdi-github"
            title="No activity yet"
            text="Commits, pull requests, and new branches for this repository will show up here."
        />

        <template v-else>
            <div
                v-if="repoFullName"
                class="activity-repo d-flex align-center ga-2 mb-4"
            >
                <v-icon
                    icon="mdi-github"
                    size="20"
                />
                <span class="activity-repo__name">{{ repoFullName }}</span>
            </div>

            <div
                v-for="group in days"
                :key="group.label"
                class="activity-day"
            >
                <div class="activity-day__label">
                    {{ group.label }}
                </div>
                <div class="activity-day__rail">
                    <div class="activity-day__line" />
                    <div
                        v-for="evt in group.events"
                        :key="evt.id"
                        class="activity-event"
                    >
                        <div
                            class="activity-event__dot"
                            :style="{ background: tintFor[evt.type] }"
                        >
                            <v-icon
                                :icon="iconFor[evt.type]"
                                size="12"
                                :color="iconColorFor[evt.type]"
                            />
                        </div>
                        <a
                            :href="evt.url"
                            target="_blank"
                            rel="noopener noreferrer"
                            class="activity-event__summary text-truncate"
                        >
                            {{ evt.summary }}
                        </a>
                        <div class="activity-event__time">
                            {{
                                new Date(evt.createdAt).toLocaleTimeString('en-US', {
                                    hour: 'numeric',
                                    minute: '2-digit',
                                })
                            }}
                        </div>
                    </div>
                </div>
            </div>
        </template>
    </div>
</template>

<style scoped>
.activity-repo__name {
    font-size: 0.8125rem;
    color: rgba(42, 52, 57, 0.6);
}

.activity-day {
    margin-bottom: 24px;
}

.activity-day__label {
    text-transform: uppercase;
    letter-spacing: 0.04em;
    font-size: 0.75rem;
    font-weight: 600;
    color: rgba(42, 52, 57, 0.6);
    margin-bottom: 10px;
}

.activity-day__rail {
    position: relative;
    padding-left: 30px;
}

.activity-day__line {
    position: absolute;
    left: 9px;
    top: 4px;
    bottom: 4px;
    width: 2px;
    background: rgba(113, 124, 130, 0.16);
}

.activity-event {
    position: relative;
    padding: 9px 0 9px 14px;
    display: flex;
    align-items: center;
    gap: 12px;
}

.activity-event__dot {
    position: absolute;
    left: -30px;
    top: 50%;
    transform: translateY(-50%);
    width: 22px;
    height: 22px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1;
    flex-shrink: 0;
}

.activity-event__summary {
    flex: 1;
    min-width: 0;
    font-family: Manrope, sans-serif;
    font-weight: 700;
    font-size: 0.9375rem;
    color: #2a3439;
    text-decoration: none;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
}

.activity-event__summary:hover {
    color: #005ac2;
}

.activity-event__time {
    font-size: 0.8125rem;
    color: rgba(42, 52, 57, 0.6);
    white-space: nowrap;
    flex-shrink: 0;
}
</style>
