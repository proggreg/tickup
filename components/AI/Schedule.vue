<script setup lang="ts">
const cron = ref('')
useHead({ script: [{ src: 'https://js.pusher.com/8.4.0/pusher.min.js', defer: false }] })


if (import.meta.client) {
    onMounted(() => {
    if (window.Pusher) {
        console.log('has pusher')
        Pusher.logToConsole = true;

        var pusher = new Pusher('b7a214caec4b1b111d91', {
        cluster: 'eu'
        });

        var channel = pusher.subscribe('my-channel');
        channel.bind('prompt', function(data) {
        alert(JSON.stringify(data));
        });
    }
    
})
}

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


</script>

<template>
  <v-container>
    <CronVuetify v-model="cron"/>
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title>Configure Schedule</v-card-title>
          <v-card-text>
            <v-form ref="form" >
                <v-text-field v-model="cron"></v-text-field>

                {{ cron }}
                
              <v-btn color="success" @click="submitSchedule">Submit</v-btn>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
   
  </v-container>
</template>
