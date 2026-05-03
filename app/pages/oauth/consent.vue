<script setup lang="ts">
import type { OAuthAuthorizationDetails } from '@supabase/supabase-js';

const route = useRoute();
const supabase = useSupabaseClient();
const user = useSupabaseUser();

const authorizationId = computed(() => {
    const v = route.query.authorization_id;
    return Array.isArray(v) ? v[0] : v;
});

const details = ref<OAuthAuthorizationDetails | null>(null);
const loading = ref(true);
const error = ref('');
const submitting = ref<'approve' | 'deny' | null>(null);

watchEffect(async () => {
  console.log("authorizationId" ,authorizationId.value) 
  if (!authorizationId.value) {
        error.value = 'Missing authorization_id';
        loading.value = false;
        return;
    }
    if (!user.value) {
        const target = `${route.path}?${new URLSearchParams(route.query as Record<string, string>).toString()}`;
        await navigateTo(`/login?redirect=${encodeURIComponent(target)}`);
        return;
    }

    const { data, error: err } = await supabase.auth.oauth.getAuthorizationDetails(authorizationId.value);
    console.log('get auth details', {
      data,
      err
    })
    if (err) {
        error.value = err.message;
    }
      else {
        details.value = data;
    }
    loading.value = false;
});

const scopes = computed(() => details.value?.scope?.split(/\s+/).filter(Boolean) ?? []);


async function approve() {
    if (!authorizationId.value) return;
    submitting.value = 'approve';
    const { data, error: err } = await supabase.auth.oauth.approveAuthorization(
        authorizationId.value,
        { skipBrowserRedirect: true },
    );
    if (err || !data?.redirect_url) {
        error.value = err?.message ?? 'Approval failed';
        submitting.value = null;
        return;
    }
    window.location.assign(data.redirect_url);
}

async function deny() {
    if (!authorizationId.value) return;
    submitting.value = 'deny';
    const { data, error: err } = await supabase.auth.oauth.denyAuthorization(
        authorizationId.value,
        { skipBrowserRedirect: true },
    );
    if (err) {
        error.value = err.message;
        submitting.value = null;
        return;
    }
    if (data?.redirect_url) {
        window.location.assign(data.redirect_url);
    }
}
</script>

<template>
    <v-row
        width="100%"
        align="center"
        justify="center"
        class="fill-height"
    >
        <v-col
            cols="12"
            sm="8"
            md="6"
            lg="5"
            xl="4"
        >
            <v-card
                class="pa-8"
                elevation="2"
                width="100%"
                data-testid="oauth-consent-card"
            >
                <v-card-title class="pa-2">
                    <h2 class="text-h5 font-weight-bold">
                        Authorize access
                    </h2>
                </v-card-title>

                <v-card-text class="pt-4">
                    <v-progress-circular
                        v-if="loading"
                        indeterminate
                    />

                    <v-alert
                        v-else-if="error"
                        type="error"
                        class="mb-4"
                        data-testid="oauth-consent-error"
                    >
                        {{ error }}
                    </v-alert>

                    <template v-else-if="details">
                        <p class="text-body-1 mb-4">
                            <strong data-testid="oauth-client-name">{{ details.client.client_name }}</strong>
                            wants to access your Tickup account.
                        </p>

                        <!-- <p class="text-subtitle-2 text-medium-emphasis mb-2">
                            Signed in as {{ details.user.email }}
                        </p> -->

                        <div
                            v-if="scopes.length"
                            class="mb-6"
                        >
                            <p class="text-subtitle-2 mb-2">
                                Requested scopes
                            </p>
                            <v-chip
                                v-for="s in scopes"
                                :key="s"
                                class="mr-2 mb-2"
                                size="small"
                            >
                                {{ s }}
                            </v-chip>
                        </div>

                        <div class="d-flex flex-column ga-3">
                            <v-btn
                                color="primary"
                                variant="flat"
                                size="large"
                                block
                                :loading="submitting === 'approve'"
                                :disabled="submitting !== null"
                                data-testid="oauth-approve"
                                @click="approve"
                            >
                                Approve
                            </v-btn>
                            <v-btn
                                color="error"
                                variant="outlined"
                                size="large"
                                block
                                :loading="submitting === 'deny'"
                                :disabled="submitting !== null"
                                data-testid="oauth-deny"
                                @click="deny"
                            >
                                Deny
                            </v-btn>
                        </div>
                    </template>
                </v-card-text>
            </v-card>
        </v-col>
    </v-row>
</template>
