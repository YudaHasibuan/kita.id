import { Client } from '@notionhq/client';

const notion = new Client({ auth: process.env.NOTION_TOKEN });

async function getRealDatabase() {
  try {
    const realDbId = "3664ecf2-4145-8029-98aa-000b74278ac2";
    const dbResponse = await notion.databases.retrieve({ database_id: realDbId });
    console.log('--- STRUKTUR DATABASE ASLI ---');
    console.log(JSON.stringify(dbResponse.properties, null, 2));
  } catch (error) {
    console.error('Gagal:', error.message);
  }
}

getRealDatabase();
