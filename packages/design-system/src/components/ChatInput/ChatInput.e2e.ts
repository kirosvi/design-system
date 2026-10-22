import { expect, type Page, test } from '@playwright/test';
import { createStoryHelper } from '@wallarm-org/playwright-config/storybook';

const chatInputStory = createStoryHelper('ai-chatinput', [
  'Default',
  'Typing',
  'Streaming',
  'With Context',
  'With Settings',
] as const);

const getTextarea = (page: Page) => page.getByTestId('chat-input--textarea');
const getSubmit = (page: Page) => page.getByTestId('chat-input--submit');

test.describe('Component: ChatInput', () => {
  test.describe('Visual', () => {
    test('Should render default state correctly', async ({ page }) => {
      await chatInputStory.goto(page, 'Default');
      await expect(page).toHaveScreenshot();
    });

    test('Should render focused ring correctly', async ({ page }) => {
      await chatInputStory.goto(page, 'Default');
      await getTextarea(page).focus();
      await expect(page).toHaveScreenshot();
    });

    test('Should render multi-row draft correctly', async ({ page }) => {
      await chatInputStory.goto(page, 'Typing');
      await expect(page).toHaveScreenshot();
    });

    test('Should render streaming state correctly', async ({ page }) => {
      await chatInputStory.goto(page, 'Streaming');
      await expect(page).toHaveScreenshot();
    });

    test('Should render stop tooltip on hover correctly', async ({ page }) => {
      await chatInputStory.goto(page, 'Streaming');
      await getSubmit(page).hover();
      await expect(page.getByRole('tooltip')).toBeVisible();
      await expect(page).toHaveScreenshot();
    });

    test('Should render with context correctly', async ({ page }) => {
      await chatInputStory.goto(page, 'With Context');
      await expect(page).toHaveScreenshot();
    });

    test('Should render with settings correctly', async ({ page }) => {
      await chatInputStory.goto(page, 'With Settings');
      await expect(page).toHaveScreenshot();
    });
  });

  test.describe('Interactions', () => {
    test.beforeEach(async ({ page }) => {
      await chatInputStory.goto(page, 'Default');
    });

    test('Should submit message when Enter is pressed', async ({ page }) => {
      const textarea = getTextarea(page);
      await textarea.fill('Hello Wally');
      await textarea.press('Enter');
      await expect(textarea).toHaveValue('');
      await expect(textarea).toBeFocused();
    });

    test('Should insert newline when Shift+Enter is pressed', async ({ page }) => {
      const textarea = getTextarea(page);
      await textarea.fill('line one');
      await textarea.press('Shift+Enter');
      await textarea.pressSequentially('line two');
      await expect(textarea).toHaveValue('line one\nline two');
    });

    test('Should stop response when Esc is pressed', async ({ page }) => {
      const textarea = getTextarea(page);
      await textarea.fill('Hello Wally');
      await textarea.press('Enter');
      await expect(getSubmit(page)).toHaveAccessibleName('Stop response');
      await textarea.press('Escape');
      await expect(getSubmit(page)).toHaveAccessibleName('Send');
    });
  });

  test.describe('Accessibility', () => {
    test('Should be announced as Send or Stop response via accessible name', async ({ page }) => {
      await chatInputStory.goto(page, 'Default');
      const submit = getSubmit(page);
      await expect(submit).toHaveAccessibleName('Send');
      await expect(submit).toBeDisabled();

      await getTextarea(page).fill('Hello');
      await expect(submit).toBeEnabled();
      await submit.click();
      await expect(submit).toHaveAccessibleName('Stop response');

      await submit.click();
      await expect(submit).toHaveAccessibleName('Send');
    });

    test('Should return focus to the textarea when Stop is pressed with an empty draft', async ({
      page,
    }) => {
      await chatInputStory.goto(page, 'Default');
      const textarea = getTextarea(page);
      await textarea.fill('Hello');
      await textarea.press('Enter');
      await getSubmit(page).focus();
      await page.keyboard.press('Enter');
      await expect(getSubmit(page)).toHaveAccessibleName('Send');
      await expect(textarea).toBeFocused();
    });
  });
});
