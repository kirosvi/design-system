import {
  type CSSProperties,
  type FC,
  type HTMLAttributes,
  type ReactNode,
  type Ref,
  useMemo,
  useRef,
} from 'react';
import { composeRefs } from '@radix-ui/react-compose-refs';
import { cn } from '../../utils/cn';
import { type TestableProps, TestIdProvider } from '../../utils/testId';
import { AppShellAmbient } from './AppShellAmbient';
import { AppShellContext } from './AppShellContext';
import { EXPAND_BORDER_MS, HERO_EASE } from './constants';
import { ExpandOverlay } from './ExpandOverlay';
import { RevealOverlay } from './RevealOverlay';
import { useShellAnimation } from './useShellAnimation';

// The aside slides on the content surface's own timing: its expand into the shell at boot.
const ASIDE_MOTION = {
  '--app-shell-aside-duration': `${EXPAND_BORDER_MS}ms`,
  '--app-shell-aside-ease': HERO_EASE,
} as CSSProperties;

export interface AppShellExpandFrom {
  width: number;
  height: number;
  borderRadius?: number;
}

export interface AppShellProps extends HTMLAttributes<HTMLDivElement>, TestableProps {
  ref?: Ref<HTMLDivElement>;
  children?: ReactNode;
  reveal?: boolean;
  expandFrom?: AppShellExpandFrom;
  onRevealed?: () => void;
  appeared?: boolean;
  /**
   * The Frame's ambient layer — soft blooms, grain and a dot cluster behind the header and
   * rail. On by default; `false` leaves the flat Frame token fill.
   */
  ambient?: boolean;
}

export const AppShell: FC<AppShellProps> = ({
  ref,
  className,
  children,
  reveal,
  expandFrom,
  onRevealed,
  appeared: appearedProp,
  ambient = true,
  'data-testid': testId,
  ...props
}) => {
  const internalRef = useRef<HTMLDivElement>(null);

  const {
    phase,
    targetRect,
    expandStyle,
    appeared,
    handleRevealOverlayTransitionEnd,
    handleExpandTransitionEnd,
  } = useShellAnimation(internalRef, { reveal, expandFrom, onRevealed, appearedProp });

  const shellContext = useMemo(() => ({ appeared }), [appeared]);

  return (
    <TestIdProvider value={testId}>
      <AppShellContext.Provider value={shellContext}>
        <div
          {...props}
          ref={composeRefs(internalRef, ref)}
          data-slot='app-shell'
          data-testid={testId}
          className={cn(
            'relative isolate grid h-screen overscroll-none [grid-template-areas:"header_header_header""rail_remote_aside"] [grid-template-columns:auto_1fr_0px] [grid-template-rows:auto_1fr] bg-component-app-shell-bg',
            // An open AppShellAside widens the third track to its margin box (480px plus 8px
            // either side) and the track slides between the two; the panel clips at the edge.
            'has-[>[data-slot=app-shell-aside][data-state=open]]:[grid-template-columns:auto_1fr_496px] has-[>[data-slot=app-shell-aside]]:overflow-x-clip',
            'transition-[grid-template-columns] duration-(--app-shell-aside-duration) ease-(--app-shell-aside-ease) motion-reduce:transition-none',
            className,
          )}
          style={{ ...ASIDE_MOTION, ...expandStyle }}
          onTransitionEnd={expandFrom ? handleExpandTransitionEnd : undefined}
        >
          {ambient && <AppShellAmbient />}
          {children}

          {expandFrom && (
            <ExpandOverlay phase={phase} expandFrom={expandFrom} targetRect={targetRect} />
          )}

          {!expandFrom && (
            <RevealOverlay
              phase={phase}
              targetRect={targetRect}
              onTransitionEnd={handleRevealOverlayTransitionEnd}
            />
          )}
        </div>
      </AppShellContext.Provider>
    </TestIdProvider>
  );
};

AppShell.displayName = 'AppShell';
