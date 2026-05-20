import { Client } from '@notionhq/client';

const notion = new Client({ auth: process.env.NOTION_TOKEN });

async function checkObject() {
  try {
    const pageId = process.env.NOTION_DATABASE_ID;
    try {
      const dbResponse = await notion.databases.retrieve({ database_id: pageId });
      console.log('INI ADALAH DATABASE!');
      console.log(JSON.stringify(dbResponse, null, 2));
      return;
    } catch (e) {
      if (e.code === 'object_not_found') {
        const pageResponse = await notion.pages.retrieve({ page_id: pageId });
        console.log('INI ADALAH HALAMAN (PAGE)!');
        console.log(JSON.stringify(pageResponse, null, 2));
      } else {
        throw e;
      }
    }
  } catch (error) {
    console.error('Gagal:', error.message);
  }
}

checkObject();
