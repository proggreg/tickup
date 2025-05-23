<script setup lang="ts">
import Pusher from 'pusher-js';
const cron = ref('*/10 * * * * *')
const runtimeConfig = useRuntimeConfig()
const running = ref(false)

onMounted(() => {
  Pusher.logToConsole = true;

    if (!runtimeConfig.public.PUSHER_KEY) {
        console.warn('PUSHER_KEY not set')
        return
    }
    var pusher = new Pusher(runtimeConfig.public.PUSHER_KEY, {
      cluster: 'eu'
    });

    var channel = pusher.subscribe('my-channel');
    channel.bind('prompt', function(data) {
      alert(JSON.stringify(data));
    });
})

const submitSchedule = async () => {
    if (!cron.value) {
        throw Error('schedule required')
    }

    try {
    const response = await $fetch('/api/ai/runTask', {
        method: 'POST',
        body: {
            cron: cron.value,
            start: true
        }
    });
    running.value = true

    console.log('response', response)
    // const reader = response.body.getReader();
    // let result = '';
    // while (true) {
    //     const { done, value } = await reader.read();
    //     if (done) {
    //         break;
    //     }
    //     result += new TextDecoder().decode(value);
    //     output.value = result.replaceAll('data:', '')
    // }
    // console.log(result);
  } catch (error) {
    console.error(error)
  }
}

const stop = async () => {
    const response = await $fetch('/api/ai/runTask', {
        method: 'POST',
        body: {
            stop: true
        }
    });

    running.value = false
}

</script>

<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title>Configure Schedule</v-card-title>
          <v-card-text>
            <v-form ref="form" >
                <v-row>
                    <v-col cols="10">
                        <v-text-field v-model="cron"></v-text-field>
                    </v-col>
                    <v-col cols="1">
                        <v-btn v-if="!running" color="success" @click="submitSchedule">Submit</v-btn>
                        <v-btn v-else @click="stop" color="danger">Stop</v-btn>
                    </v-col>
                </v-row>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template> 