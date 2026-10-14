import { chromium } from 'playwright';
import sharp from 'sharp';
import assert from 'node:assert/strict';
import { readFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

const base = process.env.NICE_TEST_URL ?? 'http://127.0.0.1:4321';
const out = process.env.NICE_SCREENSHOTS ?? join(tmpdir(), 'nice-sponsorship-float');
mkdirSync(out, { recursive: true });
const campaign = JSON.parse(readFileSync('src/content/docs/_data/sponsorship.json', 'utf8'));
const pages = Object.keys(JSON.parse(readFileSync('src/i18n/translation-status.json', 'utf8')));
const locales = [['zh-CN', ''], ['zh-Hant', '/zh-hant'], ['en', '/en']];
for (const [, prefix] of locales) for (const id of pages) {
  const path = prefix + (id === 'index' ? '/' : '/' + id + '/');
  const html = readFileSync(join('dist', path, 'index.html'), 'utf8');
  if (id === 'team-nice/frc-2027') {
    assert.ok(!html.includes('data-sponsorship-float') && !html.includes('sponsorship-reading-space'), path);
    continue;
  }
  assert.equal((html.match(/data-sponsorship-float/g) ?? []).length, 1, path);
  assert.ok(html.includes(`href="${prefix}${campaign.path}"`), path);
  assert.ok(html.includes(campaign.logo), path);
  assert.ok(!html.includes('data-campaign-banner') && !html.includes('data-campaign-motion'), path);
}
const source = await sharp('public/assets/docs/team-nice/frc-2027/nice-gift.png').ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const logo = await sharp('public' + campaign.logo).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
assert.deepEqual(logo.data, source.data, 'Use the original orange logo without recoloring');
assert.ok(logo.data.some((channel, i) => i % 4 === 0 && channel > 200 && logo.data[i + 1] < 150 && logo.data[i + 3] === 255));
console.log('All 51 content pages audited: 48 localized floating entries and 3 application-page exclusions; original orange logo preserved.');

const paths = ['/', '/transmission/gear/', '/hardware/tube-plugs/', '/structure/tube/', '/wheels/silicone-wheel/', '/team-nice/frc-2027/'];
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const errors = [];
async function setup(locale, options = {}) {
  const context = await browser.newContext(options);
  await context.addInitScript(({ locale, theme }) => {
    try {
      localStorage.setItem('starlight-theme', theme);
      localStorage.setItem('nice-language', JSON.stringify({ locale, expiresAt: Date.now() + 86400000 }));
    } catch { /* Not needed for direct localized URLs. */ }
  }, { locale, theme: options.colorScheme ?? 'light' });
  const page = await context.newPage();
  page.on('pageerror', (e) => errors.push(e.message));
  return { context, page };
}
try {
  for (const [locale, prefix] of locales) for (const width of [320, 390, 1440]) for (const theme of ['light', 'dark']) {
    const height = width === 320 ? 568 : width === 390 ? 844 : 900;
    const { context, page } = await setup(locale, { viewport: { width, height }, colorScheme: theme });
    for (const path of paths) {
      await page.goto(base + prefix + path);
      const widget = page.locator('[data-sponsorship-float]');
      if (path === campaign.path) {
        assert.equal(await widget.count(), 0, 'Application pages must not show sponsorship');
        assert.equal(await page.locator('.sponsorship-reading-space').count(), 0);
        continue;
      }
      await widget.waitFor();
      const box = await widget.boundingBox();
      assert.equal(await widget.evaluate((el) => getComputedStyle(el).position), 'fixed');
      assert.equal(await widget.evaluate((el) => getComputedStyle(el).backgroundColor), 'rgb(255, 255, 255)');
      assert.notEqual(await widget.evaluate((el) => getComputedStyle(el).boxShadow), 'none');
      assert.ok(Math.abs(width - box.x - box.width - (width < 800 ? 12 : 20)) < 2, 'Right edge is not viewport anchored');
      assert.ok(Math.abs(height - box.y - box.height - (width < 800 ? 12 : 20)) < 2, 'Bottom edge is not viewport anchored');
      assert.ok(box.y > 0 && box.x >= 0 && box.height <= 180, 'Widget is too large');
      assert.equal(await widget.locator('details').getAttribute('open'), '');
      assert.ok(await widget.evaluate((el) => el.scrollHeight === el.clientHeight && el.scrollWidth === el.clientWidth), 'Widget has internal scrolling');
      assert.equal(await widget.locator('a').getAttribute('href'), prefix + campaign.path);
      assert.equal(await widget.locator('.sponsorship-title').innerText(), campaign.locales[locale].title);
      assert.equal(await widget.locator('button').count(), 0, 'Unwanted pause button');
      assert.ok(await widget.locator('img').evaluate((img) => img.complete && img.naturalWidth === 456));
      await page.evaluate(() => scrollTo(0, document.documentElement.scrollHeight));
      const scrolled = await widget.boundingBox();
      assert.ok(Math.abs(scrolled.y - box.y) < 1 && Math.abs(scrolled.x - box.x) < 1, 'Widget moved on scroll');
      assert.ok(await widget.evaluate((el) => {
        const r = el.getBoundingClientRect();
        return el.contains(document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2));
      }), 'Footer overlaps the widget');
      const contact = page.locator('a[href="mailto:contact@nicerobotics.hk"]');
      assert.ok(await contact.evaluate((el) => {
        const r = el.getBoundingClientRect();
        return el.contains(document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2));
      }), 'Final contact link cannot be scrolled above the widget');
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
      await widget.locator('summary').click();
      assert.ok((await widget.boundingBox()).height <= 50);
      assert.equal(await widget.locator('a').isVisible(), false);
      assert.ok(await widget.evaluate((el) => el.scrollHeight === el.clientHeight && el.scrollWidth === el.clientWidth), 'Collapsed widget has internal scrolling');
      await widget.locator('summary').click();
      assert.equal(await widget.locator('a').isVisible(), true);
      if (path === '/transmission/gear/' && width !== 320) {
        await page.evaluate(() => scrollTo(0, 0));
        await page.screenshot({ path: join(out, `${locale}-${width}-${theme}.png`) });
      }
    }
    await context.close();
  }
  console.log('108 language/device/theme/page cases: fixed bottom-right, no internal scrolling, working collapse arrow, footer access, links and layout passed.');
  for (const [locale, prefix] of locales) {
    const { context, page } = await setup(locale, { viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
    await page.goto(base + prefix + '/hardware/tube-plugs/');
    const widget = page.locator('[data-sponsorship-float]');
    assert.equal(await widget.evaluate((el) => el.getAnimations({ subtree: true }).length), 0);
    await page.locator('starlight-menu-button button').click();
    assert.equal(await widget.isVisible(), false, 'Widget blocks the open mobile menu');
    await page.locator('starlight-menu-button button').click();
    assert.equal(await widget.isVisible(), true);
    await page.locator('[data-open-modal]').click();
    assert.equal(await page.locator('dialog[open]').isVisible(), true);
    await page.keyboard.press('Escape');
    await widget.locator('summary').focus();
    await page.keyboard.press('Enter');
    assert.equal(await widget.locator('details').getAttribute('open'), null);
    await page.keyboard.press('Enter');
    await widget.locator('a').focus();
    assert.equal(await widget.locator('a').evaluate((el) => getComputedStyle(el).outlineStyle), 'solid');
    await page.keyboard.press('Enter');
    await page.waitForURL('**' + prefix + campaign.path);
    assert.equal(await widget.count(), 0);
    await page.goto(base + prefix + '/structure/tube/');
    await page.emulateMedia({ media: 'print' });
    assert.equal(await widget.isVisible(), false);
    await context.close();
  }
  {
    const { context, page } = await setup('en', { javaScriptEnabled: false });
    await page.goto(base + '/en/structure/tube/');
    const widget = page.locator('[data-sponsorship-float]');
    const timing = await widget.evaluate((el) => el.getAnimations({ subtree: true }).map((a) => a.effect.getTiming()));
    assert.ok(timing.every((t) => t.iterations === 1 && t.duration <= 4000), 'Animation must end without a pause control');
    await widget.locator('summary').click();
    assert.equal(await widget.locator('a').isVisible(), false);
    await widget.locator('summary').click();
    await widget.locator('a').click();
    await page.waitForURL('**/en/team-nice/frc-2027/');
    await context.close();
  }
  assert.deepEqual(errors, []);
  console.log('Reduced motion, menu/search, keyboard, print, finite animation and no-JavaScript fallback passed.');
} finally { await browser.close(); }
