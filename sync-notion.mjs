import { Client } from '@notionhq/client';
import fs from 'fs';

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const DB_ID = process.env.NOTION_DATABASE_ID;

async function syncToNotion() {
  try {
    const content = fs.readFileSync('FEATURES_PLAN.md', 'utf-8');
    
    // Cari pola task markdown: "- [ ] **Fitur** — Deskripsi" atau "- [ ] **Fitur:** Deskripsi"
    const regex = /- \[(x| |X)\] \*\*(.*?)\*\*(?:.*?(:|—| - )) (.*)/g;
    let match;
    const tasks = [];

    while ((match = regex.exec(content)) !== null) {
      tasks.push({
        isDone: match[1] === 'x' || match[1] === 'X',
        title: match[2].trim(),
        description: match[3].trim()
      });
    }

    console.log(`Ditemukan ${tasks.length} fitur dari FEATURES_PLAN.md.`);

    const titlePropName = 'Name';

    console.log(`Mengirim data ke database Notion...`);
    
    // 2. Loop & Push ke Notion
    for (const task of tasks) {
      const statusIcon = task.isDone ? "✅" : "⏳";
      const statusText = task.isDone ? "Selesai" : "Belum Dikerjakan";

      await notion.pages.create({
        parent: { database_id: DB_ID },
        icon: {
            type: "emoji",
            emoji: task.isDone ? "✅" : "🚧"
        },
        properties: {
          [titlePropName]: {
            title: [
              { text: { content: task.title } }
            ]
          }
        },
        children: [
          {
            object: 'block',
            type: 'heading_3',
            heading_3: {
              rich_text: [{ type: 'text', text: { content: 'Deskripsi Fitur' } }]
            }
          },
          {
            object: 'block',
            type: 'paragraph',
            paragraph: {
              rich_text: [{ type: 'text', text: { content: task.description } }]
            }
          },
          {
            object: 'block',
            type: 'paragraph',
            paragraph: {
              rich_text: [
                { type: 'text', text: { content: `Status: ${statusIcon} ${statusText}`, link: null }, annotations: { bold: true } }
              ]
            }
          }
        ]
      });
      console.log(`Berhasil sinkronisasi: ${task.title}`);
    }
    
    console.log('🎉 Semua fitur berhasil di-sinkronisasi ke Notion Anda!');
  } catch (err) {
    console.error('Error saat sinkronisasi:', err.message);
  }
}

syncToNotion();
