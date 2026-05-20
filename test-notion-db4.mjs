import { Client } from '@notionhq/client';
const notion = new Client({ auth: process.env.NOTION_TOKEN });
const REAL_DB_ID = "3664ecf2-4145-80d3-b3d0-000b8c163bb4";

async function test() {
  try {
    const res = await notion.databases.retrieve({ database_id: REAL_DB_ID });
    console.log("REAL DB RETRIEVE SUCCESS:", !!res.properties);
    console.log(Object.keys(res.properties));
  } catch (e) {
    console.error(e.message);
  }
}
test();
