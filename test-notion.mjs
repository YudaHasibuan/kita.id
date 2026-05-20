import { Client } from '@notionhq/client';

const notion = new Client({ auth: process.env.NOTION_TOKEN });

async function findDatabases() {
  try {
    const response = await notion.search({
      filter: { property: 'object', value: 'database' },
    });
    
    if (response.results.length === 0) {
      console.log('Tidak ada database yang ditemukan. Pastikan Anda sudah memberikan akses/connection ke database di Notion.');
    } else {
      console.log('Database ditemukan:');
      response.results.forEach((db) => {
        console.log(`ID: ${db.id} | Nama: ${db.title[0]?.plain_text || 'Tanpa Nama'}`);
      });
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

findDatabases();
