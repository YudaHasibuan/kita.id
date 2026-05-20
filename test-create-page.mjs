import { Client } from '@notionhq/client';
const notion = new Client({ auth: process.env.NOTION_TOKEN });
const DB_ID = "3664ecf2-4145-8038-8a6f-df42e787287c"; // the linked database

async function testInsert() {
  try {
    const res = await notion.pages.create({
      parent: { database_id: DB_ID },
      properties: {
        "Name": {
          title: [
            { text: { content: "Test Task" } }
          ]
        }
      }
    });
    console.log("SUCCESS:", res.url);
  } catch (e) {
    console.error("FAILED with Name:", e.message);
    try {
      const res2 = await notion.pages.create({
        parent: { database_id: DB_ID },
        properties: {
          "title": {
            title: [
              { text: { content: "Test Task" } }
            ]
          }
        }
      });
      console.log("SUCCESS with title:", res2.url);
    } catch (e2) {
      console.error("FAILED with title:", e2.message);
    }
  }
}
testInsert();
