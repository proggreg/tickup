<script setup lang="ts">
const { data, status, signOut } = useAuth()

const loggedIn = computed(() => status.value === 'authenticated')
const name = computed(() => {
  if (!data.value.user) {
    return 'no user'
  } else if (data?.value.user?.name) {
    return data.value.user.name
  } else if (data?.value?.user?._doc){
    return data?.value?.user?._doc.username
  }
})

</script>
<template>
  <v-menu v-if="loggedIn">
    <template #activator="{ props }">
      <v-btn block v-bind="props" append-icon="mdi-chevron-down">
        <v-avatar
          v-if="data?.user?.image"
          :image="data?.user?.image"
          size="x-small"
        />
        <v-avatar
          v-else
          icon="mdi-account"
        />
        <div class="ml-2">
          {{ name }}
        </div>
      </v-btn>
    </template>
    <v-list>
      <v-list-item class="text-body-2 py-0 ma-2" append-icon="mdi-cog-outline">
        Settings
      </v-list-item>
      <v-list-item class="text-body-2 py-0 ma-2" append-icon="mdi-logout"
      @click="signOut()"
>
          Sign Out
      </v-list-item>
    </v-list>
  </v-menu>
</template>
