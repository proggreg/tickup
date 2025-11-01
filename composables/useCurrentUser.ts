/**
 * Composable for accessing current authenticated user information
 * Provides a consistent way to get user ID and user data across the app
 */
export const useCurrentUser = () => {
  const { data } = useAuth()
  
  const userId = computed(() => {
    return data.value?.user?.id || data.value?.user?.sub || ''
  })
  
  const user = computed(() => data.value?.user)
  
  const isAuthenticated = computed(() => {
    const { status } = useAuth()
    return status.value === 'authenticated'
  })
  
  return {
    userId,
    user,
    isAuthenticated,
  }
}

