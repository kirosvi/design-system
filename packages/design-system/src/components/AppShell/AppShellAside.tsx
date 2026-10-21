import type { FC, HTMLAttributes, ReactNode, Ref } from 'react';
import { cn } from '../../utils/cn';
import { useTestId } from '../../utils/testId';

export interface AppShellAsideProps extends HTMLAttributes<HTMLElement> {
  ref?: Ref<HTMLElement>;
  /**
   * Shows the panel, sliding it in from the right as the canvas narrows. Closing makes it
   * `hidden` and `inert` at once and slides it back out, after which it takes no space; under
   * reduced motion both are instant. Its children stay mounted throughout, so whatever state
   * they hold survives a close and reopen.
   */
  open: boolean;
  children?: ReactNode;
}

/**
 * A panel docked right of the content surface, in the shell's `aside` grid area. Render it
 * after `AppShellRemote`: while it is open, the remote turns into a card beside it.
 *
 * It is 480px wide. To change that, set `--app-shell-aside-width` on the `AppShell` (for example
 * `className='[--app-shell-aside-width:400px]'`), not a width class here: the shell sizes its
 * track from the same variable.
 *
 * Desktop-first: while it is open the shell needs room for the rail plus the panel. In a
 * narrower window the right end (the panel and the header's last actions) is clipped rather
 * than scrolled to, so keep a min-width on the host or close the panel on narrow viewports.
 */
export const AppShellAside: FC<AppShellAsideProps> = ({
  ref,
  open,
  className,
  children,
  ...props
}) => {
  const testId = useTestId('aside');

  return (
    <aside
      {...props}
      ref={ref}
      hidden={!open}
      inert={!open}
      data-slot='app-shell-aside'
      data-state={open ? 'open' : 'closed'}
      data-testid={testId}
      className={cn(
        // Display only while open, so the browser's own [hidden] rule hides the closed
        // region even where Tailwind preflight is not loaded.
        '[grid-area:aside] mx-8 mb-8 data-[state=open]:flex w-(--app-shell-aside-width) flex-col overflow-auto overscroll-none rounded-12 border border-border-primary-light bg-bg-page-bg pb-4',
        // Once closed it keeps painting while the shell's track slides shut, then display:none.
        'transition-[display] transition-discrete duration-(--app-shell-aside-duration) ease-(--app-shell-aside-ease) motion-reduce:transition-none',
        className,
      )}
    >
      {children}
    </aside>
  );
};

AppShellAside.displayName = 'AppShellAside';
