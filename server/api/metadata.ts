import * as cheerio from 'cheerio'

async function getTitle(url: string) {
  return await $fetch(url as string).then((response: any) => {
    try {
      const $ = cheerio.load(response)

      const title = $('title')

      return title.text().replace(/\n/g, '').trim().split(' ').slice(0, 10).join(' ')
    }
    catch (error) {
      console.error('getting title', error)
    }

    return ''
  })
}

export default defineEventHandler(async (event): Promise<{ title: string, url: string }[] | { error: string }> => {
  try {
    const { urls } = getQuery(event)
    const titles: { title: string, url: string }[] = []
    if (!urls) {
      throw new Error('No URLs provided')
    }

    const parsedUrls = JSON.parse(urls)

    if (!Array.isArray(parsedUrls)) {
      throw new Error('URLs must be an array')
    }

    if (parsedUrls.length < 1) {
      throw new Error('No URLs provided')
    }

    for (const url of parsedUrls) {
      const title = await getTitle(url)
      titles.push({ title, url })
    }

    return titles
  }
  catch (error: any) {
    console.error(error)
    return { error: error.message }
  }
})
