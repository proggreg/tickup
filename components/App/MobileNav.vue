<script setup lang="ts">
const { smAndDown } = useDisplay()
function navClick(value: string) {
  console.log(value)
}
</script>
<template>
<v-bottom-navigation v-if="smAndDown" absolute  grow>
  <v-btn to="/" value="home">
    <v-icon>mdi-home</v-icon>
    <span>Home</span>
  </v-btn>

  <v-btn to="/lists" value="lists">
    <v-icon>mdi-format-list-bulleted</v-icon>

    <span>Lists</span>
  </v-btn>

  <v-btn to="/search" value="search">
    <v-icon>mdi-magnify</v-icon>

    <span>Search</span>
  </v-btn>
</v-bottom-navigation>
</template>