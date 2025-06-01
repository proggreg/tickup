<script setup lang="ts">
const eventSource = new EventSource('http://localhost:3000/event')

eventSource.onmessage = (event) => {
  console.log(event.data)
}
</script>

<template>
  <AISchedule />
</template>
