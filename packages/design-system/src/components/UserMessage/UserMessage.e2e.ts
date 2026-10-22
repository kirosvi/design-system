import { expect, test } from '@playwright/test';
import { createStoryHelper } from '@wallarm-org/playwright-config/storybook';

const userMessageStory = createStoryHelper('ai-usermessage', [
  'Short',
  'Multiline',
  'Long Collapsed',
  'With Actions',
  'Custom Show More',
] as const);

test.describe('Component: UserMessage', () => {
  test.describe('Visual', () => {
    test('Should render a short message correctly', async ({ page }) => {
      await userMessageStory.goto(page, 'Short');
      await expect(page).toHaveScreenshot();
    });

    test('Should render a multiline message correctly', async ({ page }) => {
      await userMessageStory.goto(page, 'Multiline');
      await expect(page).toHaveScreenshot();
    });

    test('Should render a long message collapsed correctly', async ({ page }) => {
      await userMessageStory.goto(page, 'Long Collapsed');
      await expect(page.getByTestId('long--show-more')).toHaveText('Show more');
      await expect(page).toHaveScreenshot();
    });

    test('Should render the actions on hover correctly', async ({ page }) => {
      await userMessageStory.goto(page, 'With Actions');
      await page.getByTestId('with-actions--bubble').hover();
      await expect(page.getByTestId('with-actions--actions')).toHaveCSS('opacity', '1');
      await expect(page).toHaveScreenshot();
    });
  });

  test.describe('Interactions', () => {
    test('Should expand and collapse when the toggle is clicked', async ({ page }) => {
      await userMessageStory.goto(page, 'Long Collapsed');
      const toggle = page.getByTestId('long--show-more');
      await toggle.click();
      await expect(toggle).toHaveText('Show less');
      await expect(page).toHaveScreenshot();
      await toggle.click();
      await expect(toggle).toHaveText('Show more');
    });
  });

  test.describe('Accessibility', () => {
    test('Should be revealed via keyboard focus', async ({ page }) => {
      await userMessageStory.goto(page, 'With Actions');
      const actions = page.getByTestId('with-actions--actions');
      await expect(actions).toHaveCSS('opacity', '0');
      await page.keyboard.press('Tab');
      await expect(page.getByTestId('with-actions--actions--action')).toBeFocused();
      await expect(actions).toHaveCSS('opacity', '1');
    });

    test('Should be expandable via keyboard Enter key', async ({ page }) => {
      await userMessageStory.goto(page, 'Long Collapsed');
      const toggle = page.getByRole('button', { name: 'Show more' });
      await expect(toggle).toHaveAttribute('aria-expanded', 'false');
      await toggle.focus();
      await page.keyboard.press('Enter');
      await expect(page.getByTestId('long--show-more')).toHaveAttribute('aria-expanded', 'true');
    });
  });
});
