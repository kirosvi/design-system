import type { FC, HTMLAttributes, ReactNode, Ref } from 'react';
import { cn } from '../../utils/cn';
import { useTestId } from '../../utils/testId';

export interface AppShellAsideProps extends HTMLAttributes<HTMLElement> {
  ref?: Ref<HTMLElement>;
  /**
   * Shows the panel. Closed, the region takes no space and is `hidden` and `inert`, but its
   * children stay mounted, so whatever state they hold survives a close and reopen.
   */
  open: boolean;
  children?: ReactNode;
}

/**
 * A panel docked right of the content surface, in the shell's `aside` grid area. Render it
 * after `AppShellRemote`: while it is open, the remote turns into a card beside it.
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
        '[grid-area:aside] mx-8 mb-8 flex w-480 flex-col overflow-auto overscroll-none rounded-12 border border-border-primary-light bg-bg-page-bg pb-4',
        className,
      )}
    >
      {children}
    </aside>
  );
};

AppShellAside.displayName = 'AppShellAside';
