import { expect, type Page, test } from '@playwright/test';
import { createStoryHelper } from '@wallarm-org/playwright-config/storybook';

const appShellStory = createStoryHelper('navigation-appshell', ['Basic', 'With Aside'] as const);

// ThemeProvider reads the stored Frame style on mount, so seed it before the story loads.
const seedBrandedFrame = (page: Page) =>
  page.addInitScript(() => localStorage.setItem('wasd-frame-style', 'branded'));

// Storybook's theme decorator owns data-theme; flipping it after load is enough for a screenshot.
const switchToDarkTheme = (page: Page) =>
  page.evaluate(() => document.documentElement.setAttribute('data-theme', 'dark'));

// The docked panel's margin box: 480px wide plus its 8px gap and 8px right margin.
const ASIDE_TRACK = 496;

interface AsideFrame {
  remoteWidth: number;
  asideDisplay: string;
  asideInert: boolean;
}

interface AsideRecording {
  before: AsideFrame;
  frames: AsideFrame[];
}

/**
 * Clicks the header toggle and records the remote's width and the aside's state on every frame
 * until they hold still, so a test can tell an animation from a one-frame jump.
 */
const toggleAsideAndRecord = (page: Page): Promise<AsideRecording> =>
  page.evaluate(async () => {
    const byTestId = (id: string) => {
      const element = document.querySelector<HTMLElement>(`[data-testid="${id}"]`);
      if (!element) throw new Error(`No element with data-testid="${id}"`);
      return element;
    };
    const remote = byTestId('app-shell--remote');
    const aside = byTestId('app-shell--aside');
    const read = () => ({
      remoteWidth: remote.getBoundingClientRect().width,
      asideDisplay: getComputedStyle(aside).display,
      asideInert: aside.inert,
    });

    const before = read();
    document.querySelector<HTMLButtonElement>('button[aria-label="AI Assistant"]')?.click();

    const frames: ReturnType<typeof read>[] = [];
    const startedAt = performance.now();
    await new Promise<void>(resolve => {
      const onFrame = () => {
        frames.push(read());
        const recent = frames.slice(-10);
        const still =
          recent.length === 10 &&
          recent.every(
            frame =>
              frame.remoteWidth === recent[0]?.remoteWidth &&
              frame.asideDisplay === recent[0]?.asideDisplay,
          );
        if (still || performance.now() - startedAt > 3000) resolve();
        else requestAnimationFrame(onFrame);
      };
      requestAnimationFrame(onFrame);
    });
    return { before, frames };
  });

const settledFrame = ({ before, frames }: AsideRecording) => frames.at(-1) ?? before;

/** Distinct widths the remote passed through strictly between its start and its settled width. */
const inBetweenWidths = (recording: AsideRecording) => {
  const from = recording.before.remoteWidth;
  const to = settledFrame(recording).remoteWidth;
  const [low, high] = [Math.min(from, to), Math.max(from, to)];
  return new Set(recording.frames.map(f => f.remoteWidth).filter(w => w > low && w < high));
};

/** The biggest change of the remote's width from one frame to the next. */
const largestStep = ({ before, frames }: AsideRecording) => {
  const widths = [before.remoteWidth, ...frames.map(f => f.remoteWidth)];
  return Math.max(...widths.map((w, i) => Math.abs(w - (widths[i - 1] ?? w))));
};

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

    test('Should animate the aside in and narrow the remote when the toggle opens it', async ({
      page,
    }) => {
      await appShellStory.goto(page, 'With Aside');
      const docked = await page.screenshot({ animations: 'disabled' });
      // Close it first while reduced motion is still emulated, then let the opening animate.
      await toggleAsideAndRecord(page);
      await page.emulateMedia({ reducedMotion: 'no-preference' });

      const opening = await toggleAsideAndRecord(page);
      expect(opening.before.remoteWidth - settledFrame(opening).remoteWidth).toBe(ASIDE_TRACK);
      expect(inBetweenWidths(opening).size).toBeGreaterThanOrEqual(3);
      expect(largestStep(opening)).toBeLessThan(ASIDE_TRACK / 2);
      // It settles exactly where the story renders without any animation.
      expect(await page.screenshot({ animations: 'disabled' })).toEqual(docked);
    });

    test('Should animate the aside out and release its space when the toggle closes it', async ({
      page,
    }) => {
      await appShellStory.goto(page, 'With Aside');
      await page.emulateMedia({ reducedMotion: 'no-preference' });

      const closing = await toggleAsideAndRecord(page);
      // Out of reach from the first frame, yet still painted while it slides away.
      const paintedFrames = closing.frames.filter(f => f.asideDisplay !== 'none');
      expect(closing.frames[0]?.asideInert).toBe(true);
      expect(paintedFrames.length).toBeGreaterThanOrEqual(3);
      expect(inBetweenWidths(closing).size).toBeGreaterThanOrEqual(3);
      expect(largestStep(closing)).toBeLessThan(ASIDE_TRACK / 2);

      // Settled: hidden, and the canvas runs to the window edge again.
      const remote = page.getByTestId('app-shell--remote');
      await expect(page.getByTestId('app-shell--aside')).toBeHidden();
      await expect(remote).toHaveCSS('border-right-width', '0px');
      await expect(remote).toHaveCSS('border-top-right-radius', '0px');
      const box = await remote.boundingBox();
      expect((box?.x ?? 0) + (box?.width ?? 0)).toBe(page.viewportSize()?.width);
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

    test('Should be toggled without animation via the reduced-motion preference', async ({
      page,
    }) => {
      // beforeEach already emulates prefers-reduced-motion: reduce.
      await appShellStory.goto(page, 'With Aside');

      const closing = await toggleAsideAndRecord(page);
      const opening = await toggleAsideAndRecord(page);
      for (const recording of [closing, opening]) {
        const settled = settledFrame(recording);
        expect(settled.remoteWidth).not.toBe(recording.before.remoteWidth);
        // Final from the very first frame: no in-between widths, no lingering panel.
        for (const frame of recording.frames) {
          expect(frame.remoteWidth).toBe(settled.remoteWidth);
          expect(frame.asideDisplay).toBe(settled.asideDisplay);
        }
      }
    });
  });
});
