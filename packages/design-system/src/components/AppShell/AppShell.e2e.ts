import { expect, type Page, test } from '@playwright/test';
import { createStoryHelper } from '@wallarm-org/playwright-config/storybook';

const appShellStory = createStoryHelper('navigation-appshell', ['Basic', 'With Aside'] as const);

// ThemeProvider reads the stored Frame style on mount, so seed it before the story loads.
const seedBrandedFrame = (page: Page) =>
  page.addInitScript(() => localStorage.setItem('wasd-frame-style', 'branded'));

// Storybook's theme decorator owns data-theme; flipping it after load is enough for a screenshot.
const switchToDarkTheme = (page: Page) =>
  page.evaluate(() => document.documentElement.setAttribute('data-theme', 'dark'));

interface Box {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface AsideFrame {
  remoteBox: Box;
  remoteRadius: string;
  asideBox: Box;
  asideDisplay: string;
  asideInert: boolean;
  /** The panel's margin box (its width plus side margins); 0 while it is not rendered. */
  asideTrack: number;
}

interface AsideRecording {
  before: AsideFrame;
  frames: AsideFrame[];
}

/**
 * Clicks the header toggle and records the remote and the aside on every frame until they hold
 * still, so a test can tell an animation from a one-frame jump.
 */
const toggleAsideAndRecord = (page: Page): Promise<AsideRecording> =>
  page.evaluate(async () => {
    const find = <T extends HTMLElement>(selector: string) => {
      const element = document.querySelector<T>(selector);
      if (!element) throw new Error(`Nothing matches ${selector}`);
      return element;
    };
    const remote = find('[data-testid="app-shell--remote"]');
    const aside = find('[data-testid="app-shell--aside"]');
    const toggle = find<HTMLButtonElement>('button[aria-label="AI Assistant"]');
    const boxOf = (element: HTMLElement) => {
      const { x, y, width, height } = element.getBoundingClientRect();
      return { x, y, width, height };
    };
    const read = () => {
      const asideStyle = getComputedStyle(aside);
      const asideBox = boxOf(aside);
      const margins =
        Number.parseFloat(asideStyle.marginLeft) + Number.parseFloat(asideStyle.marginRight);
      return {
        remoteBox: boxOf(remote),
        remoteRadius: getComputedStyle(remote).borderTopRightRadius,
        asideBox,
        asideDisplay: asideStyle.display,
        asideInert: aside.inert,
        asideTrack: asideStyle.display === 'none' ? 0 : asideBox.width + margins,
      };
    };

    const before = read();
    toggle.click();

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
              frame.remoteBox.width === recent[0]?.remoteBox.width &&
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
  const from = recording.before.remoteBox.width;
  const to = settledFrame(recording).remoteBox.width;
  const [low, high] = [Math.min(from, to), Math.max(from, to)];
  return new Set(recording.frames.map(f => f.remoteBox.width).filter(w => w > low && w < high));
};

/** Frame-to-frame steps of the remote's width that cover at least half of `travel`. */
const bigSteps = ({ before, frames }: AsideRecording, travel: number) => {
  const widths = [before, ...frames].map(f => f.remoteBox.width);
  return widths.filter((w, i) => Math.abs(w - (widths[i - 1] ?? w)) >= Math.abs(travel) / 2).length;
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
      // Close it while reduced motion is still emulated: the frame before is the static layout.
      const docked = (await toggleAsideAndRecord(page)).before;
      await page.emulateMedia({ reducedMotion: 'no-preference' });

      const opening = await toggleAsideAndRecord(page);
      const settled = settledFrame(opening);
      const travel = opening.before.remoteBox.width - settled.remoteBox.width;
      // The canvas gives up exactly the panel's margin box, over many frames. One hitch may
      // swallow frames, so a single big step is allowed; a jump has no in-between widths at all.
      expect(travel).toBeCloseTo(docked.asideTrack, 1);
      expect(inBetweenWidths(opening).size).toBeGreaterThanOrEqual(2);
      expect(bigSteps(opening, travel)).toBeLessThanOrEqual(1);
      // It settles exactly where the story renders without any animation.
      expect(settled.remoteBox).toEqual(docked.remoteBox);
      expect(settled.asideBox).toEqual(docked.asideBox);
      expect(settled.remoteRadius).toBe(docked.remoteRadius);
    });

    test('Should animate the aside out and release its space when the toggle closes it', async ({
      page,
    }) => {
      await appShellStory.goto(page, 'With Aside');
      await page.emulateMedia({ reducedMotion: 'no-preference' });

      const closing = await toggleAsideAndRecord(page);
      const settled = settledFrame(closing);
      const travel = settled.remoteBox.width - closing.before.remoteBox.width;
      expect(travel).toBeCloseTo(closing.before.asideTrack, 1);
      expect(inBetweenWidths(closing).size).toBeGreaterThanOrEqual(2);
      expect(bigSteps(closing, travel)).toBeLessThanOrEqual(1);
      // Out of reach from the first frame, yet painted for as long as the canvas is still short
      // of its closed width: the panel never vanishes while its track is sliding shut.
      expect(closing.frames[0]?.asideInert).toBe(true);
      for (const frame of closing.frames) {
        if (frame.remoteBox.width < settled.remoteBox.width) {
          expect(frame.asideDisplay).not.toBe('none');
        }
      }

      // Settled: hidden, and the canvas runs to the window edge again.
      const remote = page.getByTestId('app-shell--remote');
      await expect(page.getByTestId('app-shell--aside')).toBeHidden();
      await expect(remote).toHaveCSS('border-right-width', '0px');
      await expect(remote).toHaveCSS('border-top-right-radius', '0px');
      const box = await remote.boundingBox();
      expect((box?.x ?? 0) + (box?.width ?? 0)).toBe(page.viewportSize()?.width);
    });

    test('Should fit the track to the panel when its width is customised', async ({ page }) => {
      await appShellStory.goto(page, 'With Aside');
      // What a host's className='[--app-shell-aside-width:400px]' on AppShell does.
      await page
        .getByTestId('app-shell')
        .evaluate(shell => shell.style.setProperty('--app-shell-aside-width', '400px'));

      const aside = page.getByTestId('app-shell--aside');
      const [marginLeft, marginRight] = await aside.evaluate(element => {
        const style = getComputedStyle(element);
        return [Number.parseFloat(style.marginLeft), Number.parseFloat(style.marginRight)];
      });
      const asideBox = await aside.boundingBox();
      const remoteBox = await page.getByTestId('app-shell--remote').boundingBox();
      const remoteRight = (remoteBox?.x ?? 0) + (remoteBox?.width ?? 0);
      const asideRight = (asideBox?.x ?? 0) + (asideBox?.width ?? 0);
      expect(asideBox?.width).toBe(400);
      // The track follows: same gap to the canvas and right margin, no empty strip, no clipping.
      expect((asideBox?.x ?? 0) - remoteRight).toBe(marginLeft);
      expect((page.viewportSize()?.width ?? 0) - asideRight).toBe(marginRight);
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
        expect(settled.remoteBox.width).not.toBe(recording.before.remoteBox.width);
        // Final from the very first frame: no in-between widths, no lingering panel.
        for (const frame of recording.frames) {
          expect(frame.remoteBox.width).toBe(settled.remoteBox.width);
          expect(frame.asideDisplay).toBe(settled.asideDisplay);
        }
      }
    });
  });
});
