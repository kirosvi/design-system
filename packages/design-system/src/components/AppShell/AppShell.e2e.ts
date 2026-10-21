import { expect, type Page, test } from '@playwright/test';
import { createStoryHelper } from '@wallarm-org/playwright-config/storybook';

const appShellStory = createStoryHelper('navigation-appshell', ['Basic', 'With Aside'] as const);

// ThemeProvider reads the stored Frame style on mount, so seed it before the story loads.
const seedBrandedFrame = (page: Page) =>
  page.addInitScript(() => localStorage.setItem('wasd-frame-style', 'branded'));

// Storybook's theme decorator owns data-theme; flipping it after load is enough for a screenshot.
const switchToDarkTheme = (page: Page) =>
  page.evaluate(() => document.documentElement.setAttribute('data-theme', 'dark'));

test.describe('Component: AppShell', () => {
  test.beforeEach(async ({ page }) => {
    // Settle every motion-aware transition before the screenshots.
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await seedBrandedFrame(page);
  });

  test.describe('Visual', () => {
    test('Should render branded frame correctly', async ({ page }) => {
      await appShellStory.goto(page, 'Basic');
      await expect(page).toHaveScreenshot({ animations: 'disabled' });
    });

    test('Should render branded frame in dark theme correctly', async ({ page }) => {
      await appShellStory.goto(page, 'Basic');
      await switchToDarkTheme(page);
      await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
      await expect(page).toHaveScreenshot({ animations: 'disabled' });
    });

    test('Should render docked aside correctly', async ({ page }) => {
      await appShellStory.goto(page, 'With Aside');
      await expect(page).toHaveScreenshot({ animations: 'disabled' });
    });
  });

  test.describe('Interactions', () => {
    test('Should render branded second rail correctly after opening a product', async ({
      page,
    }) => {
      await appShellStory.goto(page, 'Basic');
      // .first(): the rail label comes before any portalled tooltip, and "Overview" also
      // appears in the breadcrumb and page title once the product opens.
      await page.getByText('Edge', { exact: true }).first().click();
      await expect(page.getByText('Overview', { exact: true }).first()).toBeVisible();
      // Park the pointer on the canvas so no rail tooltip is open in the shot.
      await page.mouse.move(800, 400);
      await expect(page).toHaveScreenshot({ animations: 'disabled' });
    });

    test('Should keep aside content when the header toggle closes and reopens it', async ({
      page,
    }) => {
      await appShellStory.goto(page, 'With Aside');
      const toggle = page.getByRole('button', { name: 'AI Assistant' });
      // Test ids resolve the aside even while it is hidden, so toBeHidden checks the real node.
      const aside = page.getByTestId('app-shell--aside');
      const message = aside.getByRole('textbox', { name: 'Message' });
      const remote = page.getByTestId('app-shell--remote');
      await expect(remote).toHaveCSS('border-right-width', '1px');
      await message.fill('Show recent attacks');

      await toggle.click();
      await expect(aside).toBeHidden();
      await expect(toggle).toHaveAttribute('aria-pressed', 'false');
      // Closed, the canvas runs to the window edge again, as in a shell without an aside.
      await expect(remote).toHaveCSS('border-right-width', '0px');

      await toggle.click();
      await expect(message).toHaveValue('Show recent attacks');
    });
  });

  test.describe('Accessibility', () => {
    test('Should be closable via keyboard from inside the panel with focus returned to the toggle', async ({
      page,
    }) => {
      await appShellStory.goto(page, 'With Aside');
      const aside = page.getByTestId('app-shell--aside');
      const closeButton = aside.getByRole('button', { name: 'Close' });
      await closeButton.focus();
      await expect(closeButton).toBeFocused();

      await page.keyboard.press('Enter');
      await expect(aside).toBeHidden();
      await expect(page.getByRole('button', { name: 'AI Assistant' })).toBeFocused();
    });
  });
});
