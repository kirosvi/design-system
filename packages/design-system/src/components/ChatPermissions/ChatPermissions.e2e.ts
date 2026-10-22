import { expect, type Page, test } from '@playwright/test';
import { createStoryHelper } from '@wallarm-org/playwright-config/storybook';

const permissionsStory = createStoryHelper('ai-chatpermissions', ['All On', 'Some Off'] as const);

const getTrigger = (page: Page) => page.getByTestId('permissions--trigger');
const getContent = (page: Page) => page.getByTestId('permissions--content');

const openPermissions = async (page: Page) => {
  await getTrigger(page).click();
  await expect(getContent(page)).toBeVisible();
};

test.describe('Component: ChatPermissions', () => {
  test.describe('Visual', () => {
    test('Should render open popover with all tools on correctly', async ({ page }) => {
      await permissionsStory.goto(page, 'All On');
      await openPermissions(page);
      await expect(page).toHaveScreenshot({ animations: 'disabled' });
    });

    test('Should render open popover with some tools off correctly', async ({ page }) => {
      await permissionsStory.goto(page, 'Some Off');
      await openPermissions(page);
      await expect(page).toHaveScreenshot({ animations: 'disabled' });
    });
  });

  test.describe('Interactions', () => {
    test('Should keep the popover open when a tool is toggled', async ({ page }) => {
      await permissionsStory.goto(page, 'All On');
      await openPermissions(page);

      const row = page.getByTestId('permission-search_attacks');
      const input = row.locator('input');
      await expect(input).toBeChecked();

      await row.click();

      await expect(input).not.toBeChecked();
      await expect(getContent(page)).toBeVisible();
    });
  });

  test.describe('Accessibility', () => {
    test('Should be announced as Permission settings via keyboard focus tooltip', async ({
      page,
    }) => {
      await permissionsStory.goto(page, 'All On');
      const trigger = getTrigger(page);
      await expect(trigger).toHaveAccessibleName('Permission settings');

      await page.keyboard.press('Tab');
      await expect(trigger).toBeFocused();
      await expect(page.getByTestId('permissions--tooltip')).toHaveText('Permission settings');
    });
  });
});
