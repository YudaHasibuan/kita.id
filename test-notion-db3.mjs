import { Client } from '@notionhq/client';
const notion = new Client({ auth: process.env.NOTION_TOKEN });
const DB_ID = process.env.NOTION_DATABASE_ID;

async function test() {
  try {
    const res = await notion.databases.retrieve({ database_id: DB_ID });
    console.log("DB RETRIEVE:", JSON.stringify(res, null, 2));
  } catch (e) {
    if (e.code === 'object_not_found') {
      const pageRes = await notion.pages.retrieve({ page_id: DB_ID });
      console.log("PAGE RETRIEVE:", JSON.stringify(pageRes, null, 2));
    } else {
      console.error(e);
    }
  }
}
test();
