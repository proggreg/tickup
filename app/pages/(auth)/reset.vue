<script setup lang="ts">
definePageMeta({
    layout: 'login-register',
});

// const supabase = useSupabaseClient();
const email = ref('');
const password = ref('');

async function resetPassword() {
    // const { data: user, error } = await supabase.auth.admin.updateUserById(
    //     '6aa5d0d4-2a9f-4483-b6c8-0cf4c6c98ac4',
    //     { password: 'new_password' },
    // );
    // ;

    // if (error) {
    //     console.error('Signup failed:', error);
    // }
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
                            v-model="email"
                            label="Email"
                            type="email"
                            variant="outlined"
                            prepend-inner-icon="mdi-email"
                            class="mb-6"
                            required
                        />

                        <v-text-field
                            v-model="password"
                            label="Password"
                            type="password"
                            variant="outlined"
                            prepend-inner-icon="mdi-lock"
                            class="mb-8"
                            required
                        />

                        <v-btn
                            type="submit"
                            color="primary"
                            variant="flat"
                            size="large"
                            block
                            class="mb-4"
                            :disabled="!email || !password"
                        >
                            Reset Password
                        </v-btn>
                    </v-form>
                </v-card-text>
            </v-card>
        </v-col>
    </v-row>
</template>
