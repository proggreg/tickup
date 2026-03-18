import { serverSupabaseClient } from '#supabase/server';
import type { Octokit } from 'octokit';
import { App } from 'octokit';
import type { Database } from '~/types/database.types';

export async function getGithubToken(event) {
    const supabase = await serverSupabaseClient<Database>(event);
    const userToken = await supabase.from('user_integrations').select('access_token').single();
    return userToken.data.access_token;
}

export async function getGithubInstallation(event): Promise<Octokit> {
    const supabase = await serverSupabaseClient<Database>(event);
    const config = useRuntimeConfig();
    const { data: userData } = await supabase
        .from('Users')
        .select('github_installation_id')
        .single();

    if (!userData?.github_installation_id) {
        throw createError({ statusCode: 403, message: 'GitHub integration not connected. Connect it in Settings.' });
    }

    const app = new App({
        appId: config.private.github.appId,
        privateKey: config.private.github.privateKey,
    });
    return await app.getInstallationOctokit(userData.github_installation_id);
}

export async function listWebhooks(octokit) {
    type RawWebhook = Awaited<ReturnType<(typeof octokit)['rest']['repos']['listWebhooks']>>['data'][number];
    type Webhook = RawWebhook & { repoFullName: string };
    let webhooks: Webhook[] = [];
    try {
        const { data: repos } = await octokit.rest.apps.listReposAccessibleToInstallation();
        for (const repo of repos.repositories) {
            const { data } = await octokit.rest.repos.listWebhooks({
                owner: repo.owner.login,
                repo: repo.name,
            });

            const repoFullName = `${repo.owner.login}/${repo.name}`;
            webhooks = webhooks.concat(data.map(hook => ({ ...hook, repoFullName })));
        }

        return webhooks;
    }
    catch (err) {
        console.error(err);
        return err;
    }
}
