<script setup lang="ts">
const user = useSupabaseUser()
const redirectInfo = useSupabaseCookieRedirect()

watch(user, async () => {
  if (user.value) {
    try {
      // Ensure user exists in our Users table
      await $fetch('/api/user/create', {
        method: 'POST',
        body: {
          username: user.value.email?.split('@')[0] || 'user'
        }
      })
    } catch (error) {
      console.warn('User creation failed or user already exists:', error)
    }
    
    // Get redirect path, and clear it from the cookie
    const path = redirectInfo.pluck()
    // Redirect to the saved path, or fallback to home
    return navigateTo(path || '/') 
  }
}, { immediate: true })
</script>

<template>
  <div>Waiting for login...</div>
</template>
