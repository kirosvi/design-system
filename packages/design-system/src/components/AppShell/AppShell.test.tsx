import { describe, expect, it } from '@rstest/core';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AppShell } from './AppShell';
import { AppShellAside } from './AppShellAside';
import { AppShellRemote } from './AppShellRemote';

describe('AppShell ambient', () => {
  it('renders the Frame ambient layer by default, hidden from assistive tech', () => {
    render(
      <AppShell data-testid='shell'>
        <AppShellRemote>content</AppShellRemote>
      </AppShell>,
    );

    const ambient = screen.getByTestId('shell--ambient');
    expect(ambient).toHaveAttribute('aria-hidden', 'true');
    // Decorative only: nothing inside is focusable or reachable by pointer.
    expect(ambient.querySelector('button, a, [tabindex]')).toBeNull();
    // Painted under the regions: it precedes them in DOM order.
    const shell = screen.getByTestId('shell');
    expect(shell.firstElementChild).toBe(ambient);
  });

  it('omits the ambient layer when ambient={false}', () => {
    render(
      <AppShell data-testid='shell' ambient={false}>
        <AppShellRemote>content</AppShellRemote>
      </AppShell>,
    );

    expect(screen.queryByTestId('shell--ambient')).toBeNull();
  });

  it('keeps the ambient test id derived from the shell test id only', () => {
    const { container } = render(
      <AppShell>
        <AppShellRemote>content</AppShellRemote>
      </AppShell>,
    );

    const ambient = container.firstElementChild?.firstElementChild;
    expect(ambient).toHaveAttribute('aria-hidden', 'true');
    expect(ambient).not.toHaveAttribute('data-testid');
  });
});

describe('AppShellAside', () => {
  it('renders children in an aside landmark when open', () => {
    render(
      <AppShell data-testid='shell'>
        <AppShellRemote />
        <AppShellAside open aria-label='AI Assistant'>
          panel
        </AppShellAside>
      </AppShell>,
    );

    const aside = screen.getByRole('complementary', { name: 'AI Assistant' });
    expect(aside).toHaveTextContent('panel');
    expect(screen.getByTestId('shell--aside')).toBe(aside);
  });

  it('hides the region but keeps children mounted while closed', async () => {
    const user = userEvent.setup();
    const shell = (open: boolean) => (
      <AppShell data-testid='shell'>
        <AppShellRemote />
        <AppShellAside open={open} aria-label='AI Assistant'>
          <input data-testid='field' />
        </AppShellAside>
      </AppShell>
    );
    const { rerender } = render(shell(true));
    const field = screen.getByTestId('field');
    await user.type(field, 'abc');

    rerender(shell(false));
    const aside = screen.getByTestId('shell--aside');
    expect(aside).toHaveAttribute('hidden');
    expect(aside).toHaveAttribute('inert');
    expect(screen.queryByRole('complementary')).toBeNull();
    // Same node, so whatever state the panel holds survives the close.
    expect(screen.getByTestId('field')).toBe(field);

    rerender(shell(true));
    expect(aside).not.toHaveAttribute('hidden');
    expect(aside).not.toHaveAttribute('inert');
    expect(screen.getByTestId('field')).toHaveValue('abc');
  });

  it('marks the shell while the aside is open', () => {
    const shell = (open: boolean) => (
      <AppShell data-testid='shell'>
        <AppShellRemote />
        <AppShellAside open={open}>panel</AppShellAside>
      </AppShell>
    );
    const { rerender } = render(shell(true));
    const aside = screen.getByTestId('shell--aside');
    expect(aside).toHaveAttribute('data-state', 'open');

    rerender(shell(false));
    expect(aside).toHaveAttribute('data-state', 'closed');

    // jsdom cannot evaluate the CSS, so pin the hook: the remote restyles itself
    // against an open aside sibling through :has() on that very state.
    expect(screen.getByTestId('shell--remote').className).toContain(
      '[data-slot=app-shell-aside][data-state=open]',
    );
  });

  it('leaves the shell layout unchanged without an aside', () => {
    render(
      <AppShell data-testid='shell'>
        <AppShellRemote>content</AppShellRemote>
      </AppShell>,
    );

    expect(screen.queryByTestId('shell--aside')).toBeNull();
    expect(screen.queryByRole('complementary')).toBeNull();
  });
});
