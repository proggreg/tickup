import type { EmitterWebhookEvent } from '@octokit/webhooks';

type PushEvent = EmitterWebhookEvent<'push'>['payload'];
type PullRequestEvent = EmitterWebhookEvent<'pull_request'>['payload'];
type DeleteEvent = EmitterWebhookEvent<'delete'>['payload'];

export async function handlePush(supabase: any, _payload: PushEvent, subscribedUserIds: string[], branchName: string) {
    const { data, error } = await supabase
        .from('Todos')
        .update({ status: 'In Progress' })
        .in('user_id', subscribedUserIds)
        .eq('github_branch_name', branchName)
        .select();

    console.log('todo updated', data);

    if (error) {
        console.error('Error updating todo status for push event:', error);
    }
}

export async function handlePullRequest(supabase, body, subscribedUserIds, branchName) {
    const pr = body.pull_request;
    const merged = pr?.merged;

    if (merged) {
        const { error } = await supabase
            .from('Todos')
            .update({ status: 'Closed' })
            .in('user_id', subscribedUserIds)
            .eq('github_branch_name', branchName);

        if (error) {
            console.error('Error updating todo status for pull request event:', error);
        }
    }
}

export async function handleDelete(supabase: any, _payload: DeleteEvent, subscribedUserIds: string[], branchName: string) {
    const { error } = await supabase
        .from('Todos')
        .update({ status: 'Closed' })
        .in('user_id', subscribedUserIds)
        .eq('github_branch_name', branchName);

    if (error) {
        console.error('Error updating todo status for delete event:', error);
    }
}
