export async function handlePush(supabase, subscribedUserIds, branchName, repoMatchFilter) {
    const { error } = await supabase
        .from('Todos')
        .update({ status: 'In Progress' })
        .in('user_id', subscribedUserIds)
        .eq('github_branch_name', branchName)
        .or(repoMatchFilter);

    if (error) {
        console.error('Error updating todo status for push event:', error);
    }
}

export async function handlePullRequest(supabase, body, subscribedUserIds, branchName, repoMatchFilter) {
    const pr = body.pull_request;
    const merged = pr.merged;

    if (merged) {
        const { error } = await supabase
            .from('Todos')
            .update({ status: 'Closed' })
            .in('user_id', subscribedUserIds)
            .eq('github_branch_name', branchName)
            .or(repoMatchFilter);

        if (error) {
            console.error('Error updating todo status for delete event:', error);
        }
    }
}

export async function handleDelete(supabase, subscribedUserIds, branchName, repoMatchFilter) {
    const { error } = await supabase
        .from('Todos')
        .update({ status: 'Closed' })
        .in('user_id', subscribedUserIds)
        .eq('github_branch_name', branchName)
        .or(repoMatchFilter);

    if (error) {
        console.error('Error updating todo status for delete event:', error);
    }
}
