export const useHasGithub = async () => {
  return await $fetch('/api/github/check')
}
