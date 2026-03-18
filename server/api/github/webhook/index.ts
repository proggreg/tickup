import { defineEventHandler, readBody, getQuery } from 'h3';
import { serverSupabaseServiceRole } from '#supabase/server';
import type { Database } from '~/types/database.types';
import { handleDelete, handlePullRequest, handlePush } from './events';
import type { EmitterWebhookEvent } from '@octokit/webhooks';

type PushEvent = EmitterWebhookEvent<'push'>['payload'];
type PullRequestEvent = EmitterWebhookEvent<'pull_request'>['payload'];
type DeleteEvent = EmitterWebhookEvent<'delete'>['payload'];

export default defineEventHandler(async (event) => {
    const supabase = await serverSupabaseServiceRole<Database>(event);
    const query = await getQuery(event);
    const userIdValue = query.userId;
    const userId = Array.isArray(userIdValue) ? userIdValue[0] : userIdValue;

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

    if (typeof userId !== 'string') {
        return {
            status: 'error',
            message: 'Missing required query parameter: userId',
        };
    }

    const body = await readBody<unknown>(event);

    try {
        const githubEvent = event.headers.get('X-GitHub-Event');
        if (!githubEvent || !['push', 'pull_request', 'delete'].includes(githubEvent)) {
            return {
                status: 'ignored',
                message: `Unhandled GitHub event: ${githubEvent}`,
            };
        }

        let branchName: string | undefined;
        let repoFullName: string | undefined;

        if (githubEvent === 'push') {
            const payload = body as PushEvent;
            branchName = payload.ref?.split('/').pop();
            repoFullName = payload.repository?.full_name;
        }
        else if (githubEvent === 'pull_request') {
            const payload = body as PullRequestEvent;
            branchName = payload.pull_request?.head?.ref;
            repoFullName = payload.repository?.full_name;
        }
        else if (githubEvent === 'delete') {
            const payload = body as DeleteEvent;
            branchName = payload.ref?.split('/').pop();
            repoFullName = payload.repository?.full_name;
        }

        if (!branchName || !repoFullName) {
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

        if (githubEvent === 'push') {
            handlePush(supabase, body as PushEvent, subscribedUserIds, branchName);

            return {
                status: 'success',
                message: 'Push webhook processed',
            };
        }

        if (githubEvent === 'pull_request') {
            handlePullRequest(supabase, body as PullRequestEvent, subscribedUserIds, branchName);

            return {
                status: 'success',
                message: 'Pull Request webhook processed',
            };
        }

        if (githubEvent === 'delete') {
            handleDelete(supabase, body as DeleteEvent, subscribedUserIds, branchName);

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
