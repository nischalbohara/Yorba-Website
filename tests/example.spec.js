const { test, expect } = require('@playwright/test');

test.describe.configure({ mode: 'parallel' });

const BASE_URL = process.env.BASE_URL || 'https://www.yorba.co';

// Core site routes
const CORE_ROUTES = [
  '/',
  '/pricing',
  '/product',
  '/free-tools',
  '/yorblog',
  '/privacy-policy',
  '/terms-of-service',
];

// Product feature sub-pages
const PRODUCT_ROUTES = [
  '/product/account-deletion',
  '/product/cancel-subscriptions',
  '/product/email-cleanup',
  '/product/breach-monitoring',
  '/product/deletion-team',
  '/free-tools/breach-beacon',
  '/free-tools/mail-minimizer',
];

// All Yorblog article routes
const BLOG_ROUTES = [
  '/yorblog/bill-solominsky-interview',
  '/yorblog/personal-info-removal',
  '/yorblog/tony-fish',
  '/yorblog/jdm-vs-yorba-add',
  '/yorblog/death-to-graymail',
  '/yorblog/yorba-vs-unrollme',
  '/yorblog/yorba-vs-rocket-money',
  '/yorblog/find-and-cancel-subscriptions',
  '/yorblog/ryder-caroll-interview',
  '/yorblog/2024-report',
  '/yorblog/if-your-data-was-breached',
  '/yorblog/yorba-vs-leavemealone',
  '/yorblog/unsubscribe-from-emails-quickly',
  '/yorblog/subscription-tracking-tools',
  '/yorblog/delete-desk',
  '/yorblog/find-and-delete-old-accounts',
  '/yorblog/is-incognito-mode-safe',
  '/yorblog/mass-unsubscribe-on-gmail',
  '/yorblog/ben-comstock-interview',
  '/yorblog/minimalists-journey',
  '/yorblog/doc-searls-interview',
  '/yorblog/whiz-queen-interview',
  '/yorblog/your-feedback2',
  '/yorblog/forced-consent',
  '/yorblog/what-is-a-public-benefit-corporation',
  '/yorblog/what-is-digital-footprint',
  '/yorblog/why-we-built-yorba',
  '/yorblog/your-feedback1',
];

function sanitizeRouteToFilename(route) {
  const cleaned = route.replace(/^\/+|\/+$/g, '').replace(/[/\\?%*:|"<>]/g, '-');
  return `${cleaned || 'home'}.png`;
}

async function handleCookieBanner(page) {
  const cookieBanner = page.getByTestId('banner');
  const acceptButton = page.getByTestId('actionButton-accept');

  try {
    await cookieBanner.waitFor({ state: 'visible', timeout: 3000 });
    await acceptButton.click();
    await cookieBanner.waitFor({ state: 'hidden', timeout: 3000 });
  } catch (error) {
    // Banner absent or previously handled
  }
}

async function triggerLazyLoading(page) {
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      let totalHeight = 0;
      const distance = 300;
      const timer = setInterval(() => {
        const scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;

        if (totalHeight >= scrollHeight) {
          clearInterval(timer);
          window.scrollTo(0, 0);
          resolve(true);
        }
      }, 100);
    });
  });

  await page.waitForTimeout(1000);
}

/**
 * Reusable test runner function for any given route
 */
async function runVisualTest(page, route) {
  const targetUrl = new URL(route, BASE_URL).toString();

  await page.goto(targetUrl, { waitUntil: 'domcontentloaded' });
  await handleCookieBanner(page);
  await triggerLazyLoading(page);

  const screenshotName = sanitizeRouteToFilename(route);
  await expect(page).toHaveScreenshot(screenshotName, {
    fullPage: true,
    maxDiffPixelRatio: 0.05,
  });
}

// -----------------------------------------------------------------------------
// Core Pages & Products Test Suite
// -----------------------------------------------------------------------------
test.describe('Core & Product Pages Visual Tests', () => {
  for (const route of [...CORE_ROUTES, ...PRODUCT_ROUTES]) {
    test(`Core Page: ${route}`, async ({ page }) => {
      await runVisualTest(page, route);
    });
  }
});

// -----------------------------------------------------------------------------
// Yorblog Pages Test Suite
// -----------------------------------------------------------------------------
test.describe('Yorblog Articles Visual Tests', () => {
  for (const route of BLOG_ROUTES) {
    test(`Blog Post: ${route}`, async ({ page }) => {
      await runVisualTest(page, route);
    });
  }
});