<script setup lang="ts">
definePageMeta({
    layout: 'login-register',
});

const supabase = useSupabaseClient();
const password = ref('');

async function resetPassword() {
    const { error } = await supabase.auth.updateUser(
        { password: password.value },
    );
    ;

    if (error) {
        console.error('Signup failed:', error);
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
            lg="4"
            xl="3"
        >
            <v-card
                class="pa-8"
                elevation="2"
                width="100%"
            >
                <v-card-item class="mb-4">
                    <v-img
                        class="mx-auto"
                        width="50%"
                        rounded="xl"
                        src="/pwa-512x512.png"
                    />
                </v-card-item>

                <v-card-text>
                    <v-form @submit.prevent="resetPassword">
                        <v-text-field
                            v-model="password"
                            label="Password"
                            type="password"
                            variant="outlined"
                            prepend-inner-icon="mdi-lock"
                            class="mb-8"
                            required
                            new-password
                        />

                        <v-btn
                            type="submit"
                            color="primary"
                            variant="flat"
                            size="large"
                            block
                            class="mb-4"
                            :disabled="!password"
                        >
                            Reset Password
                        </v-btn>
                    </v-form>
                </v-card-text>
            </v-card>
        </v-col>
    </v-row>
</template>
