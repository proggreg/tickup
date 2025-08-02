<script setup lang="ts">


onMounted(() => {
    const url = new URL(window.location.href)
    const code = url.searchParams.get('code')
    if (code) {
    }
})
</script>

<template>
  <SettingsLayout>
    <v-btn href="https://github.com/login/oauth/authorize?client_id=Iv23linDCFjo6MvVPHfa" size="x-large" class="ma-12">Link Github</v-btn>
  </SettingsLayout>
</template>
