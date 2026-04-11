import * as cheerio from 'cheerio';
import type { Meta } from '~/types/link.types';

async function getTitle(url: string) {
    return await $fetch(url as string, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
    }).then((response: any) => {
        try {
            const $ = cheerio.load(response);
            const title = $('title').text() as string;

            if (!title) {
                return url.split('?')[0];
            }
            return title;
        }
        catch (error) {
            console.error('getting title', error);
        }
    });
}

export default defineEventHandler(async (event): Promise<Meta[] | { error: string }> => {
    try {
        const { urls } = getQuery(event);
        const titles: Meta[] = [];
        if (!urls) {
            throw new Error('No URLs provided');
        }

        const parsedUrls = JSON.parse(Array.isArray(urls) ? urls[0] : urls);

        if (!Array.isArray(parsedUrls)) {
            throw new Error('URLs must be an array');
        }

        if (parsedUrls.length < 1) {
            throw new Error('No URLs provided');
        }

        for (const url of parsedUrls) {
            const title = await getTitle(url);
            if (!title) continue;

            titles.push({ title, url });
        }

        return titles;
    }
    catch (error: any) {
        console.error(error);
        return { error: error.message };
    }
});
