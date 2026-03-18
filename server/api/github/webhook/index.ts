import { defineEventHandler, readBody, getQuery } from 'h3';
import { serverSupabaseServiceRole } from '#supabase/server';
import type { Database } from '~/types/database.types';
import { handleDelete, handlePullRequest, handlePush } from './events';

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
    const supabase = await serverSupabaseServiceRole<Database>(event);
    const { userId } = await getQuery(event);

    if (event.method === 'GET') {
        const query = getQuery(event);
        const ref = Array.isArray(query.ref) ? query.ref[0] : query.ref;

        const { data, error } = await supabase
            .from('Todos')
            .update({ status: 'Closed' })
            .eq('github_branch_name', ref)
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

        const repoFullName = body.repository?.full_name;
        const repoName = body.repository?.name;

        if (!githubEvent || !branchName || !repoFullName) {
            return {
                status: 'ignored',
                message: 'Missing required webhook metadata',
            };
        }

        const { data: users, error: usersError } = await supabase
            .from('Users')
            .select('id, github_webhook_subscriptions')
            .eq('id', userId);

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
            handlePush(supabase, subscribedUserIds, branchName, repoMatchFilter);

            return {
                status: 'success',
                message: 'Push webhook processed',
            };
        }

        if (githubEvent === 'pull_request') {
            handlePullRequest(supabase, body, subscribedUserIds, branchName, repoMatchFilter);

            return {
                status: 'success',
                message: 'Pull Request webhook processed',
            };
        }

        if (githubEvent === 'delete') {
            handleDelete(supabase, subscribedUserIds, branchName, repoMatchFilter);

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
