<script setup lang="ts">
import type { Repo } from '~/components/Github/RepoSelect.vue';

type EventType = 'commit' | 'pr' | 'branch' | 'deployment';

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
    branch?: string;
    vercelProjectId?: string;
}>();

const loading = ref(false);
const error = ref('');
const events = ref<ActivityEvent[]>([]);
const repoFullName = ref('');

const iconFor: Record<EventType, string> = {
    commit: 'mdi-source-commit',
    pr: 'mdi-source-pull',
    branch: 'mdi-source-branch',
    deployment: 'mdi-rocket-launch-outline',
};

const tintFor: Record<EventType, string> = {
    commit: '#d8e2ff',
    pr: '#d3f5df',
    branch: '#e1e9ee',
    deployment: '#f3e5f5',
};

const iconColorFor: Record<EventType, string> = {
    commit: '#004eaa',
    pr: '#1b8a3d',
    branch: 'rgba(42, 52, 57, 0.6)',
    deployment: '#7b1fa2',
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

const latestDeploymentUrl = computed(
    () => events.value.find((evt) => evt.type === 'deployment')?.url,
);

const days = computed<DayGroup[]>(() => {
    const groups: DayGroup[] = [];
    for (const evt of events.value) {
        const label = dayLabel(evt.createdAt);
        let group = groups.find((g) => g.label === label);
        if (!group) {
            group = { label, events: [] };
            groups.push(group);
        }
        group.events.push(evt);
    }
    return groups;
});

// currentTodo.githubRepo may already be "owner/repo" (set by GithubButton's
// selectedRepo.full_name) or just the bare repo name (older data) — handle both.
function parseOwnerRepo(): { owner: string; repo: string } | null {
    if (!props.repoName.includes('/')) return null;
    const [owner, repo] = props.repoName.split('/');
    return owner && repo ? { owner, repo } : null;
}

async function resolveOwner(repo: string): Promise<string | null> {
    try {
        const data = await $fetch<{ repositories: Repo[] }>('/api/github/repos');
        const match = data.repositories.find((r) => r.name === repo);
        return match?.full_name?.split('/').shift() ?? null;
    } catch {
        return null;
    }
}

async function load() {
    if (!props.repoName) return;
    loading.value = true;
    error.value = '';
    try {
        const direct = parseOwnerRepo();
        const repo = direct?.repo ?? props.repoName;
        const owner = direct?.owner ?? (await resolveOwner(repo));
        if (!owner) {
            error.value = 'Could not find repository owner';
            return;
        }
        repoFullName.value = `${owner}/${repo}`;
        const data = await $fetch<{ events: ActivityEvent[] }>('/api/github/activity', {
            query: { owner, repo, branch: props.branch, vercelProjectId: props.vercelProjectId },
        });
        events.value = data.events;
    } catch (e: any) {
        error.value = e?.data?.message || 'Failed to load GitHub activity';
    } finally {
        loading.value = false;
    }
}

onMounted(load);
watch(() => [props.repoName, props.branch, props.vercelProjectId], load);
</script>

<template>
    <div class="activity-timeline">
        <div v-if="loading" class="d-flex align-center justify-center py-8">
            <v-progress-circular indeterminate size="28" color="primary" />
        </div>

        <v-alert v-else-if="error" type="error" variant="tonal" class="ma-4">
            {{ error }}
        </v-alert>

        <v-empty-state
            v-else-if="!events.length"
            icon="mdi-github"
            title="No activity yet"
            :text="
                branch
                    ? `Commits, pull requests, and branch creation for ${branch} will show up here.`
                    : 'Commits, pull requests, and new branches for this repository will show up here.'
            "
        />

        <template v-else>
            <div v-if="repoFullName" class="d-flex align-center ga-4 mb-4">
                <div class="d-flex align-center ga-2">
                    <v-icon icon="mdi-github" size="20" />
                    <span class="text-body-2 text-medium-emphasis">{{ repoFullName }}</span>
                </div>
                <a
                    v-if="latestDeploymentUrl"
                    :href="latestDeploymentUrl"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="d-flex align-center ga-2 text-decoration-none"
                >
                    <v-icon icon="mdi-triangle" size="14" />
                    <span class="text-body-2 text-medium-emphasis">Vercel</span>
                </a>
            </div>

            <div v-for="group in days" :key="group.label" class="mb-6">
                <div
                    class="text-caption text-medium-emphasis text-uppercase font-weight-bold mb-2"
                    style="letter-spacing: 0.04em"
                >
                    {{ group.label }}
                </div>
                <v-timeline density="compact" align="start" side="end" truncate-line="both">
                    <v-timeline-item
                        v-for="evt in group.events"
                        :key="evt.id"
                        size="small"
                        :icon="iconFor[evt.type]"
                        :dot-color="tintFor[evt.type]"
                        :icon-color="iconColorFor[evt.type]"
                    >
                        <div class="d-flex align-center ga-2">
                            <a
                                :href="evt.url"
                                target="_blank"
                                rel="noopener noreferrer"
                                class="text-body-2 font-weight-bold text-truncate text-decoration-none text-high-emphasis flex-grow-1"
                            >
                                {{ evt.summary }}
                            </a>
                            <span class="text-caption text-medium-emphasis text-no-wrap">
                                {{
                                    new Date(evt.createdAt).toLocaleTimeString('en-US', {
                                        hour: 'numeric',
                                        minute: '2-digit',
                                    })
                                }}
                            </span>
                        </div>
                    </v-timeline-item>
                </v-timeline>
            </div>
        </template>
    </div>
</template>
