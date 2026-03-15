import { defineEventHandler, readBody, getQuery } from 'h3';
import { serverSupabaseClient } from '#supabase/server';
import type { Database } from '~/types/database.types';

type WebhookPayload = {
    ref?: string;
    repository?: {
        name?: string;
        full_name?: string;
    };
    installation?: {
        id?: number;
    };
};

export default defineEventHandler(async (event) => {
    const supabase = await serverSupabaseClient<Database>(event);

    if (event.method === 'GET') {
        const query = getQuery(event);
        const ref = query.ref;

        const { data, error } = await supabase
            .from('Todos')
            .update({ status: 'Closed' })
            .eq('github_branch_name', ref || ref[0])
            .select()
            .single();

        if (error) {
            console.error('Error updating todo:', error);
            return null;
        }

        return data;
    }

    const body = await readBody<WebhookPayload>(event);

    try {
        const githubEvent = event.headers.get('X-GitHub-Event');
        const branchName = body.ref?.split('/').pop();
        const installationId = body.installation?.id || Number(event.headers.get('X-GitHub-Hook-Installation-Target-ID'));
        const repoFullName = body.repository?.full_name;
        const repoName = body.repository?.name;

        if (!githubEvent || !branchName || !installationId || !repoFullName) {
            return {
                status: 'ignored',
                message: 'Missing required webhook metadata',
            };
        }

        const { data: users, error: usersError } = await supabase
            .from('Users')
            .select('id, github_webhook_subscriptions')
            .eq('github_installation_id', installationId);

        if (usersError || !users?.length) {
            return {
                status: 'ignored',
                message: 'No matching users for installation',
            };
        }

        const subscribedUserIds = users
            .filter((user) => {
                const subscriptions = user.github_webhook_subscriptions;
                if (!Array.isArray(subscriptions)) {
                    return true;
                }

                return subscriptions.includes(repoFullName);
            })
            .map(user => user.id);

        if (!subscribedUserIds.length) {
            return {
                status: 'ignored',
                message: 'No users subscribed to this repository',
            };
        }

        const repoMatchFilter = repoName
            ? `github_repo.eq.${repoFullName},github_repo.eq.${repoName}`
            : `github_repo.eq.${repoFullName}`;

        if (githubEvent === 'push') {
            const { error } = await supabase
                .from('Todos')
                .update({ status: 'In Progress' })
                .in('user_id', subscribedUserIds)
                .eq('github_branch_name', branchName)
                .or(repoMatchFilter);

            if (error) {
                console.error('Error updating todo status for push event:', error);
            }

            return {
                status: 'success',
                message: 'Push webhook processed',
            };
        }

        if (githubEvent === 'delete') {
            const { error } = await supabase
                .from('Todos')
                .update({ status: 'Closed' })
                .in('user_id', subscribedUserIds)
                .eq('github_branch_name', branchName)
                .or(repoMatchFilter);

            if (error) {
                console.error('Error updating todo status for delete event:', error);
            }

            return {
                status: 'success',
                message: 'Delete webhook processed',
            };
        }

        return {
            status: 'ignored',
            message: `Unhandled GitHub event: ${githubEvent}`,
        };
    }
    catch (error) {
        console.error('Webhook error:', error);

        return {
            status: 'error',
            message: error instanceof Error ? error.message : 'Unknown error',
        };
    }
});
