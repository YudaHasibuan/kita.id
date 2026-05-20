import { Client } from '@notionhq/client';
import fs from 'fs';

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const DB_ID = process.env.NOTION_DATABASE_ID;

async function syncToNotionV2() {
  try {
    console.log('Membaca FEATURES_PLAN.md...');
    const lines = fs.readFileSync('FEATURES_PLAN.md', 'utf-8').split('\n');
    const categories = [];
    let currentCategory = null;

    for (const line of lines) {
      // Deteksi kategori baru: "## 1. 🔐 Judul"
      const catMatch = line.match(/^## \d+\.\s*(.*)/);
      if (catMatch) {
        if (currentCategory) categories.push(currentCategory);
        currentCategory = { title: catMatch[1].trim(), tools: '', items: [] };
        continue;
      }
      
      if (currentCategory) {
        // Deteksi tools
        const toolMatch = line.match(/^>\s*🛠 Tool:\s*(.*)/);
        if (toolMatch) {
          currentCategory.tools = toolMatch[1].trim();
          continue;
        }

        // Deteksi sub-item task
        const itemMatch = line.match(/^- \[(x| |X)\] \*\*(.*?)\*\*(?:.*?(:|—| - ))\s*(.*)/);
        if (itemMatch) {
          currentCategory.items.push({
            isDone: itemMatch[1].toLowerCase() === 'x',
            title: itemMatch[2].trim(),
            description: itemMatch[4].trim()
          });
        }
      }
    }
    if (currentCategory) categories.push(currentCategory);

    console.log(`Ditemukan ${categories.length} Kategori Utama.`);

    console.log('Menghapus data lama dari database Notion agar tidak duplikat...');
    const searchRes = await notion.search({ filter: { property: "object", value: "page" } });
    const pagesToDelete = searchRes.results.filter(p => p.parent?.database_id?.replace(/-/g, '') === DB_ID.replace(/-/g, ''));
    for (const page of pagesToDelete) {
      await notion.pages.update({ page_id: page.id, archived: true });
    }

    console.log('Mengirim format baru ke Notion...');
    
    for (const category of categories) {
      // Hitung persentase progress
      const totalItems = category.items.length;
      const doneItems = category.items.filter(i => i.isDone).length;
      const progressPercent = totalItems === 0 ? 0 : Math.round((doneItems / totalItems) * 100);
      const titleWithProgress = `[${progressPercent}%] ${category.title}`;

      // Siapkan blok sub-items (to-do list)
      const todoBlocks = category.items.map(item => ({
        object: 'block',
        type: 'to_do',
        to_do: {
          rich_text: [
            { type: 'text', text: { content: `${item.title}: `, link: null }, annotations: { bold: true } },
            { type: 'text', text: { content: item.description } }
          ],
          checked: item.isDone
        }
      }));

      await notion.pages.create({
        parent: { database_id: DB_ID },
        properties: {
          "Name": {
            title: [
              { text: { content: titleWithProgress } }
            ]
          }
        },
        children: [
          {
            object: 'block',
            type: 'heading_2',
            heading_2: {
              rich_text: [{ type: 'text', text: { content: '🛠 Tools & Teknologi' } }]
            }
          },
          {
            object: 'block',
            type: 'paragraph',
            paragraph: {
              rich_text: [{ type: 'text', text: { content: category.tools || 'Tidak ada tool khusus' } }]
            }
          },
          {
            object: 'block',
            type: 'divider',
            divider: {}
          },
          {
            object: 'block',
            type: 'heading_2',
            heading_2: {
              rich_text: [{ type: 'text', text: { content: '✅ Rincian Sub Task' } }]
            }
          },
          ...todoBlocks
        ]
      });
      console.log(`Berhasil sinkronisasi: ${titleWithProgress}`);
    }
    
    console.log('🎉 Struktur project dan sub-item berhasil di-sinkronisasi!');
  } catch (err) {
    console.error('Error saat sinkronisasi:', err.message);
  }
}

syncToNotionV2();
