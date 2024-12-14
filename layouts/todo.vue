<script setup lang="ts">
const colorMode = useColorMode()
const listStore = useListsStore()
const router = useRouter()
console.log(router.getRoutes())
</script>

<template>
  <ColorScheme>
    <v-theme-provider with-background :theme="colorMode.preference">
      <v-app>
        <v-layout>
          <app-nav />
          <v-main>
            <v-container style="height: 100%" fluid>
              <v-row class="fill-height">
                <v-col cols="12">
                  <v-btn @click="$router.back()">
                    <template #prepend>
                      <v-icon>mdi-arrow-left</v-icon>
                    </template>
                    {{ listStore.currentList.name }}
                  </v-btn>
                </v-col>
                <NuxtPage />
              </v-row>
            </v-container>
          </v-main>
        </v-layout>
      </v-app>
    </v-theme-provider>
  </ColorScheme>
</template>
