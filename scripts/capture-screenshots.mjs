import { chromium } from 'playwright';
import { mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, '../public/screenshots');

const PILLARS = [
  {
    slug: 'doradztwo',
    url: 'https://profitia-pl.onrender.com/services/projekty-doradcze',
    sections: [
      { name: 'hero',               scrollY: 0 },
      { name: 'value-proposition',  scrollY: 950 },
      { name: 'offer',              scrollY: 1900 },
      { name: 'cta',                scrollFrac: 0.75 },
      { name: 'footer',             scrollFrac: 1.0 },
    ],
  },
  {
    slug: 'edukacja',
    url: 'https://profitia-pl.onrender.com/education/akademia-zakupow',
    sections: [
      { name: 'hero',               scrollY: 0 },
      { name: 'value-proposition',  scrollY: 950 },
      { name: 'offer',              scrollY: 1900 },
      { name: 'cta',                scrollFrac: 0.75 },
      { name: 'footer',             scrollFrac: 1.0 },
    ],
  },
  {
    slug: 'career',
    url: 'https://profitia-pl.onrender.com/career',
    sections: [
      { name: 'hero',               scrollY: 0 },
      { name: 'value-proposition',  scrollY: 950 },
      { name: 'offer',              scrollY: 1900 },
      { name: 'cta',                scrollFrac: 0.75 },
      { name: 'footer',             scrollFrac: 1.0 },
    ],
  },
];

const browser = await chromium.launch({ headless: true });

for (const pillar of PILLARS) {
  const dir = join(OUT, pillar.slug);
  mkdirSync(dir, { recursive: true });

  const page = await browser.newPage();
  await page.setViewportSize({ width: 1440, height: 900 });
  // Override mobile detection
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'userAgent', {
      get: () => 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    });
  });

  console.log(`→ ${pillar.slug}: ${pillar.url}`);
  await page.goto(pillar.url, { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(1500);
  // Dismiss any modal/dialog
  await page.keyboard.press('Escape');
  await page.waitForTimeout(500);

  const pageHeight = await page.evaluate(() => document.documentElement.scrollHeight);
  console.log(`  pageHeight: ${pageHeight}`);

  for (const section of pillar.sections) {
    let scrollY;
    if (section.scrollFrac !== undefined) {
      scrollY = Math.round((pageHeight - 900) * section.scrollFrac);
    } else {
      scrollY = section.scrollY;
    }
    scrollY = Math.max(0, Math.min(scrollY, pageHeight - 900));

    await page.evaluate((y) => window.scrollTo(0, y), scrollY);
    await page.waitForTimeout(700);

    const path = join(dir, `${section.name}.jpg`);
    await page.screenshot({ path, type: 'jpeg', quality: 88 });
    console.log(`  ✓ ${section.name} (scrollY=${scrollY})`);
  }

  await page.close();
}

await browser.close();
console.log('\n✅ All screenshots captured.');
