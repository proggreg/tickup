<script setup lang="ts">
definePageMeta({
  title: 'Account',
  description: 'Account page',
})

// const supabase = useSupabaseClient()
// const user = useSupabaseUser()

const logout = async () => {
  // await supabase.auth.signOut()
  await navigateTo('/login')
}
</script>

<template>
  <v-row no-gutters class="d-flex " style="height: 100%;">
    <v-col class="d-flex justify-center" cols="12">
      <h1> My Account</h1>
      <div style="position: absolute; right: 25px">
        <AppDarkMode />
      </div>
    </v-col>
    <v-col class="d-flex justify-center" cols="12">
      <h4>{{ user?.email }}</h4>
    </v-col>

    <v-col class="d-flex flex-column-reverse py-6" cols="12">
      <div>
        <v-btn block class="my-2" variant="tonal" to="settings">settings</v-btn>
        <v-btn block class="my-auto" variant="tonal" @click="logout">Logout</v-btn>
      </div>
    </v-col>
  </v-row>
</template>s
