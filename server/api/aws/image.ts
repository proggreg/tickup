import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from '@aws-sdk/client-bedrock-runtime'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const prompt = 'this a banner image for a todo list named' + body.prompt
    const client = new BedrockRuntimeClient({
      region: 'us-east-1',
    })

    const command = new InvokeModelCommand({
      modelId: 'stability.stable-diffusion-xl-v1',
      contentType: 'application/json',
      accept: 'application/json',
      body: JSON.stringify({
        text_prompts: [{ text: prompt, weight: 1 }, { text: 'remove text', weight: -1 }],
        width: 1536,
        height: 640,
        steps: 10,
        seed: 0,
        cfg_scale: 30,
      }),
    })

    const response = await client.send(command)
    const responseBody = JSON.parse(new TextDecoder().decode(response.body))
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
