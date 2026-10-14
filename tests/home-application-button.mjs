import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

// Retain the existing command name; the homepage entry is now a ribbon banner.
const base = process.env.NICE_TEST_URL ?? 'http://127.0.0.1:4321';
const out = process.env.NICE_SCREENSHOTS ?? join(tmpdir(), 'nice-campaign-screenshots');
mkdirSync(out, { recursive: true });
const languages = [
  ['', 'zh-CN', '申请赞助', 'FRC 队伍赞助计划'],
  ['/zh-hant', 'zh-Hant', '申請贊助', 'FRC 隊伍贊助計畫'],
  ['/en', 'en', 'Apply for sponsorship', 'FRC Team Sponsorship'],
];
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const errors = [];
async function setup(locale, options = {}) {
  const context = await browser.newContext(options);
  await context.addInitScript(({ locale, theme }) => {
    try {
      localStorage.setItem('starlight-theme', theme);
      localStorage.setItem('nice-language', JSON.stringify({ locale, expiresAt: Date.now() + 86400000 }));
    } catch { /* Storage is optional. */ }
  }, { locale, theme: options.colorScheme ?? 'light' });
  const page = await context.newPage();
  page.on('pageerror', (error) => errors.push(error.message));
  return { context, page };
}
try {
  for (const [prefix, locale, label, title] of languages) {
    for (const width of [320, 390, 1440]) for (const theme of ['light', 'dark']) for (const reducedMotion of ['no-preference', 'reduce']) {
      const height = width === 320 ? 568 : width === 390 ? 844 : 900;
      const { context, page } = await setup(locale, { viewport: { width, height }, colorScheme: theme, reducedMotion });
      await page.goto(base + prefix + '/');
      const banner = page.locator('[data-campaign-banner]');
      const action = page.getByRole('link', { name: `${label} — ${title}`, exact: true });
      await action.waitFor();
      const box = await banner.boundingBox();
      const heading = await page.locator('h1').boundingBox();
      const cta = await banner.locator('.campaign-cta').boundingBox();
      const header = await page.locator('.nice-header').boundingBox();
      assert.ok(box.y >= header.y + header.height - 1, 'Banner is obscured by the header');
      assert.ok(box.y + box.height < height, `${locale} ${width}: banner is not fully above the fold`);
      assert.ok(box.height >= 200 && box.y + box.height < heading.y, 'Banner should be large and before Welcome');
      assert.ok(cta.x >= box.x && cta.x + cta.width <= box.x + box.width, 'CTA exceeds banner width');
      assert.equal(await action.getAttribute('href'), prefix + '/team-nice/frc-2027/');
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'Horizontal overflow');
      assert.ok(await banner.locator('img').evaluate((img) => img.complete && img.naturalWidth === 456), 'Provided logo did not load');
      assert.equal(await page.locator('.nice-title-action').count(), 0, 'Old title button was not replaced');
      const toggle = banner.locator('[data-campaign-motion]');
      if (reducedMotion === 'reduce') {
        assert.equal(await banner.getAttribute('data-motion'), 'paused');
        assert.equal(await toggle.isVisible(), false);
        assert.equal(await banner.evaluate((el) => el.getAnimations({ subtree: true }).length), 0);
      } else {
        assert.equal(await banner.getAttribute('data-motion'), 'running');
        assert.ok(await banner.evaluate((el) => {
          const animations = el.getAnimations({ subtree: true });
          return animations.length === 3 && animations.every((a) => a.playState === 'running');
        }));
        await toggle.click();
        assert.equal(await banner.getAttribute('data-motion'), 'paused');
        const before = await banner.evaluate(async (el) => {
          const animations = el.getAnimations({ subtree: true });
          await Promise.all(animations.map((a) => a.ready));
          return animations.map((a) => a.currentTime);
        });
        await page.waitForTimeout(80);
        const after = await banner.evaluate((el) => el.getAnimations({ subtree: true }).map((a) => a.currentTime));
        assert.deepEqual(after, before, 'Animation keeps moving while paused');
        await toggle.click();
        assert.equal(await banner.getAttribute('data-motion'), 'running');
      }
      if (reducedMotion === 'reduce' && width !== 320) {
        await page.screenshot({ path: join(out, `${locale}-${width}-${theme}.png`) });
      }
      await context.close();
    }
  }
  console.log('Ribbon: 36 language/viewport/theme/motion cases passed; first-fold layout, logo, CTA, pause/play and reduced motion.');
  {
    const { context, page } = await setup('en', { viewport: { width: 390, height: 844 } });
    await page.goto(base + '/en/');
    const toggle = page.locator('[data-campaign-motion]');
    await toggle.click();
    await page.reload();
    assert.equal(await page.locator('[data-campaign-banner]').getAttribute('data-motion'), 'paused');
    await toggle.focus();
    await page.keyboard.press('Enter');
    assert.equal(await page.locator('[data-campaign-banner]').getAttribute('data-motion'), 'running');
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.waitForFunction(() => document.querySelector('[data-campaign-banner]').dataset.motion === 'paused');
    assert.equal(await toggle.isVisible(), false);
    const action = page.locator('.campaign-link');
    await action.focus();
    assert.equal(await action.evaluate((el) => getComputedStyle(el).outlineStyle), 'solid');
    await page.keyboard.press('Enter');
    await page.waitForURL('**/en/team-nice/frc-2027/');
    await context.close();
  }
  {
    const { context, page } = await setup('zh-CN');
    await context.addInitScript(() => {
      Storage.prototype.setItem = () => { throw new Error('Storage unavailable'); };
      Storage.prototype.getItem = () => { throw new Error('Storage unavailable'); };
    });
    await page.goto(base + '/en/');
    await page.locator('[data-campaign-motion]').click();
    assert.equal(await page.locator('[data-campaign-banner]').getAttribute('data-motion'), 'paused');
    await context.close();
  }
  {
    const { context, page } = await setup('en', { javaScriptEnabled: false });
    await page.goto(base + '/en/');
    assert.equal(await page.locator('[data-campaign-motion]').isVisible(), false);
    assert.ok(await page.locator('[data-campaign-banner]').evaluate((el) => el.getAnimations({ subtree: true }).every((a) => a.playState === 'paused')));
    await page.locator('.campaign-link').click();
    await page.waitForURL('**/en/team-nice/frc-2027/');
    await context.close();
  }
  assert.deepEqual(errors, []);
  console.log('Keyboard, stored pause preference, live motion preference, blocked storage and no-JavaScript navigation passed.');
} finally { await browser.close(); }
