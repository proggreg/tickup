import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from '@aws-sdk/client-bedrock-runtime'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    console.log('generate image', body)
    const prompt = body.prompt
    const client = new BedrockRuntimeClient({
      region: 'us-east-1',
      credentials: {
        accessKeyId: useRuntimeConfig().awsAccessKey,
        secretAccessKey: useRuntimeConfig().awsSecretKey,
      },
      }
    })

    const command = new InvokeModelCommand({
      modelId: 'stability.stable-diffusion-xl-v1',
      contentType: 'application/json',
      accept: 'application/json',
      body: JSON.stringify({
        text_prompts: [{ text: prompt }],
        width: 1024,
        height: 256,
        steps: 50,
        seed: 10,
        cfg_scale: 10,
        style_preset: 'photographic',
      }),
    })

    const response = await client.send(command)
    console.log('model response', response)
    const responseBody = JSON.parse(new TextDecoder().decode(response.body))
    console.log('responseBody', responseBody)
    const base64Image = responseBody.artifacts[0].base64
    return `data:image/png;base64,${base64Image}`
  }
  catch (error) {
    console.error('Error generating image:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to generate image',
    })
  }
})
