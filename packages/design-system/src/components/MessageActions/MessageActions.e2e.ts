import { expect, test } from '@playwright/test';
import { createStoryHelper } from '@wallarm-org/playwright-config/storybook';

const messageActionsStory = createStoryHelper('ai-messageactions', [
  'User',
  'Wally',
  'Visible',
  'Pressed Feedback',
] as const);

test.describe('Component: MessageActions', () => {
  test.describe('Visual', () => {
    test('Should render user message actions correctly', async ({ page }) => {
      await messageActionsStory.goto(page, 'User');
      await expect(page).toHaveScreenshot();
    });

    test('Should render Wally message actions correctly', async ({ page }) => {
      await messageActionsStory.goto(page, 'Wally');
      await expect(page).toHaveScreenshot();
    });

    test('Should render pressed feedback correctly', async ({ page }) => {
      await messageActionsStory.goto(page, 'Pressed Feedback');
      await expect(page.getByTestId('feedback-up')).toHaveAttribute('aria-pressed', 'true');
      await expect(page).toHaveScreenshot();
    });
  });

  test.describe('Interactions', () => {
    test('Should show the tooltip when an action is hovered', async ({ page }) => {
      await messageActionsStory.goto(page, 'Wally');
      await page.getByTestId('wally-actions--up').hover();
      await expect(page.getByRole('tooltip')).toHaveText('Good response');
      await expect(page).toHaveScreenshot();
    });

    test('Should open the menu with the tooltip anchored when Ellipsis is clicked', async ({
      page,
    }) => {
      await messageActionsStory.goto(page, 'Wally');
      const more = page.getByTestId('wally-actions--more');
      await more.hover();
      const tooltip = page.getByRole('tooltip');
      await expect(tooltip).toHaveText('More actions');

      const moreBox = await more.boundingBox();
      const tooltipBox = await tooltip.boundingBox();
      expect(moreBox).not.toBeNull();
      expect(tooltipBox).not.toBeNull();
      if (moreBox && tooltipBox) {
        // Anchored to the button, not the viewport origin.
        expect(
          Math.abs(tooltipBox.x + tooltipBox.width / 2 - (moreBox.x + moreBox.width / 2)),
        ).toBeLessThan(4);
      }

      await more.click();
      await expect(page.getByRole('menu')).toBeVisible();
      await expect(page).toHaveScreenshot();
    });

    test('Should reveal the actions when the message is hovered', async ({ page }) => {
      await messageActionsStory.goto(page, 'Visible');
      const actions = page.getByTestId('actions-default');
      await expect(actions).toHaveCSS('opacity', '0');
      await page.getByTestId('message-default').hover();
      await expect(actions).toHaveCSS('opacity', '1');
    });

    test('Should toggle aria-pressed when a thumb is clicked', async ({ page }) => {
      await messageActionsStory.goto(page, 'Pressed Feedback');
      await page.getByTestId('feedback-down').click();
      await expect(page.getByTestId('feedback-down')).toHaveAttribute('aria-pressed', 'true');
      await expect(page.getByTestId('feedback-up')).toHaveAttribute('aria-pressed', 'false');
    });
  });

  test.describe('Accessibility', () => {
    test('Should be revealed via keyboard focus', async ({ page }) => {
      await messageActionsStory.goto(page, 'Visible');
      const actions = page.getByTestId('actions-default');
      await expect(actions).toHaveCSS('opacity', '0');
      await page.keyboard.press('Tab');
      await expect(page.getByTestId('actions-default--copy')).toBeFocused();
      await expect(actions).toHaveCSS('opacity', '1');
    });

    test('Should be exposed as a named group via role', async ({ page }) => {
      await messageActionsStory.goto(page, 'Wally');
      await expect(page.getByRole('group', { name: 'Message actions' })).toBeVisible();
    });
  });
});
