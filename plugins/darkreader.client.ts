import DarkReader from 'darkreader'

export default defineNuxtPlugin(() => {
  return {
    provide: {
      DarkReader: DarkReader,
    },
  }
})
