import { expect, test } from '@playwright/test';
import { createStoryHelper } from '@wallarm-org/playwright-config/storybook';

const chatStory = createStoryHelper('ai-chat', [
  'Header Default',
  'Header With Thread Select',
  'Greeting',
  'Suggestions',
  'Backgrounds',
  'Trigger',
  'Trigger With Drawer',
] as const);

test.describe('Component: Chat', () => {
  test.describe('Visual', () => {
    test('Should render default header correctly', async ({ page }) => {
      await chatStory.goto(page, 'Header Default');
      await expect(page).toHaveScreenshot();
    });

    test('Should render thread select header correctly', async ({ page }) => {
      await chatStory.goto(page, 'Header With Thread Select');
      await expect(page).toHaveScreenshot();
    });

    test('Should render empty greeting state correctly', async ({ page }) => {
      await chatStory.goto(page, 'Greeting');
      await expect(page).toHaveScreenshot();
    });

    test('Should render footer and greeting suggestions correctly', async ({ page }) => {
      await chatStory.goto(page, 'Suggestions');
      await expect(page).toHaveScreenshot();
    });

    test('Should render all background variants correctly', async ({ page }) => {
      await chatStory.goto(page, 'Backgrounds');
      await expect(page).toHaveScreenshot();
    });

    test('Should render the trigger with its tooltip correctly', async ({ page }) => {
      await chatStory.goto(page, 'Trigger');
      await page.getByTestId('chat-trigger').hover();
      await expect(page.getByRole('tooltip', { name: 'Ask Wally' })).toBeVisible();
      await expect(page).toHaveScreenshot();
    });

    test('Should render suggestion hover state correctly', async ({ page }) => {
      await chatStory.goto(page, 'Greeting');
      await page.getByTestId('chat--suggestion-0').hover();
      await expect(page).toHaveScreenshot();
    });
  });

  test.describe('Interactions', () => {
    test('Should call the consumer onClick when a suggestion is clicked', async ({ page }) => {
      await chatStory.goto(page, 'Greeting');
      await page.getByTestId('chat--suggestion-1').click();
      await expect(page.getByTestId('chat--picked')).toHaveText(
        'Picked: Show top attacked endpoints',
      );
    });

    test('Should show the Ask Wally tooltip when the trigger is hovered', async ({ page }) => {
      await chatStory.goto(page, 'Trigger');
      await page.getByTestId('chat-trigger').hover();
      await expect(page.getByRole('tooltip', { name: 'Ask Wally' })).toBeVisible();
    });

    test('Should open the chat drawer when the trigger is clicked', async ({ page }) => {
      await chatStory.goto(page, 'Trigger With Drawer');
      const trigger = page.getByTestId('chat-trigger');
      await expect(trigger).toHaveAttribute('aria-expanded', 'false');
      await trigger.click();
      await expect(page.getByTestId('chat')).toBeVisible();
      await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    });

    test('Should open the more menu when the ellipsis button is clicked', async ({ page }) => {
      await chatStory.goto(page, 'Header Default');
      await page.getByTestId('chat--header').getByRole('button', { name: 'More actions' }).click();
      await expect(page.getByRole('menuitem', { name: 'Rename chat' })).toBeVisible();
    });
  });

  test.describe('Accessibility', () => {
    test('Should show the trigger tooltip on keyboard focus', async ({ page }) => {
      await chatStory.goto(page, 'Trigger With Drawer');
      await page.keyboard.press('Tab');
      await expect(page.getByRole('button', { name: 'Ask Wally' })).toBeFocused();
      await expect(page.getByRole('tooltip', { name: 'Ask Wally' })).toBeVisible();
    });

    test('Should be navigable from header to body via Tab key', async ({ page }) => {
      await chatStory.goto(page, 'Greeting');
      const header = page.getByTestId('chat--header');

      await page.keyboard.press('Tab');
      await expect(header.getByRole('button', { name: 'Chat history' })).toBeFocused();
      await page.keyboard.press('Tab');
      await expect(header.getByRole('button', { name: 'More actions' })).toBeFocused();
      await page.keyboard.press('Tab');
      await expect(header.getByRole('button', { name: 'Close chat' })).toBeFocused();
      await page.keyboard.press('Tab');
      await expect(page.getByTestId('chat--suggestion-0')).toBeFocused();
    });

    test('Should be exposed as a named region with a message log via roles', async ({ page }) => {
      await chatStory.goto(page, 'Greeting');
      await expect(page.getByRole('region', { name: 'Wally chat' })).toBeVisible();
      await expect(page.getByRole('log', { name: 'Chat messages' })).toBeVisible();
    });
  });
});
