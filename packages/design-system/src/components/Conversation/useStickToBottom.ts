import { useEffect, useRef, useState } from 'react';

const reducedMotion = () =>
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches; // FeedbackPulse precedent

const isEditable = (target: EventTarget | null) =>
  target instanceof HTMLElement &&
  (target.isContentEditable || target.matches('input, textarea, select'));

const SCROLL_UP_KEYS = new Set(['ArrowUp', 'PageUp', 'Home']);

// A nested scroller (a code block) that can still scroll up takes the gesture, not the log.
const innerScrollsUp = (target: EventTarget | null, root: HTMLElement) => {
  for (
    let el = target instanceof Element ? target : null;
    el && el !== root;
    el = el.parentElement
  ) {
    if (el.scrollTop > 0) return true;
  }
  return false;
};

// Module scope: the compiler treats hook arguments as frozen, so DOM writes go through a helper.
const pin = (el: HTMLElement) => {
  el.scrollTop = el.scrollHeight;
};
const setTop = (el: HTMLElement, top: number) => {
  el.scrollTop = top;
};

// A critically damped spring towards the live end, re-read every frame: a streamed line or a
// growing answer moves the target mid-flight, so nothing snaps at the end (native smooth scroll
// aims once, lands short, and the next resize jumps the rest).
const OMEGA = 0.02; // 1/ms: a streamed line settles in ~200ms
const MAX_SPEED = 3; // px/ms: a long way back reads as a scroll, not a teleport
const MAX_DT = 1000 / 60; // a dropped frame does not turn into one big jump

/**
 * Keeps a scroll element pinned to the bottom while its content grows, until the reader scrolls
 * up; re-sticks on scroll back down, `scrollToBottom()` or an `autoScrollKey` change.
 * Internal to `Conversation` (spec v2 §7.6).
 */
export function useStickToBottom(
  scrollEl: HTMLElement | null,
  contentEl: HTMLElement | null,
  threshold: number,
  autoScrollKey: unknown,
) {
  const [isAtBottom, setIsAtBottom] = useState(true);
  const stuck = useRef(true); // read and written only in effects and handlers — never in render
  // The effect's animator, for scrollToBottom and the autoScrollKey effect.
  const follow = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!scrollEl || !contentEl) return;
    let lastTop = scrollEl.scrollTop;
    let lastHeight = scrollEl.scrollHeight;
    const near = () =>
      scrollEl.scrollHeight - scrollEl.scrollTop - scrollEl.clientHeight <= threshold;
    // One rAF loop for streaming follow and the button. Only ever moves forward; stops the frame
    // the reader shows intent (stuck drops) or the end is reached.
    let frame = 0;
    let velocity = 0;
    let lastTime = 0;
    const sync = () => {
      lastTop = scrollEl.scrollTop;
      lastHeight = scrollEl.scrollHeight;
      // Still at the bottom while the animator follows on its own: a big chunk leaves a gap above
      // the threshold for a few frames, and the button must not flash. Intent drops stuck at once.
      setIsAtBottom((stuck.current && frame !== 0) || near()); // same value → React bails out
    };
    // Scoped to the log: utils/hasTextSelection is page-wide.
    const selecting = () => {
      const selection = document.getSelection();
      return !!selection && !selection.isCollapsed && scrollEl.contains(selection.anchorNode);
    };
    const stop = () => {
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
      velocity = 0;
    };
    const step = (now: number) => {
      frame = 0;
      if (!stuck.current || selecting()) return stop();
      const top = scrollEl.scrollTop;
      const gap = scrollEl.scrollHeight - scrollEl.clientHeight - top;
      if (gap <= 1) {
        if (gap > 0) setTop(scrollEl, top + gap);
        return stop();
      }
      // The first frame has no previous one; rAF time can also trail performance.now().
      const dt = lastTime && now > lastTime ? Math.min(now - lastTime, MAX_DT) : MAX_DT;
      lastTime = now;
      velocity = Math.min(
        MAX_SPEED,
        Math.max(0, velocity + (OMEGA * OMEGA * gap - 2 * OMEGA * velocity) * dt),
      );
      // Scheduled first: the scroll this write fires must see a running animator (sync).
      frame = requestAnimationFrame(step);
      // At least a pixel: the spring's tail must not crawl through sub-pixel offsets.
      setTop(scrollEl, top + Math.min(gap, Math.max(1, velocity * dt)));
    };
    const start = () => {
      if (!stuck.current || selecting()) return;
      if (reducedMotion()) {
        pin(scrollEl);
        return;
      }
      if (frame) return;
      lastTime = 0;
      frame = requestAnimationFrame(step);
    };
    follow.current = start;
    // Content grew or shrank, or the viewport changed (a docked card or a taller textarea).
    const onResize = () => {
      start();
      sync();
    };
    const onScroll = () => {
      // A clamp after a fold is not the reader scrolling up.
      const shrank = scrollEl.scrollHeight < lastHeight;
      // Nor is a clamp after the viewport grew (a docked card resolved): it stays at the end.
      // 1px tolerance: browsers land smooth scrolls on sub-pixel offsets just short of the end.
      const clamped = scrollEl.scrollTop >= scrollEl.scrollHeight - scrollEl.clientHeight - 1;
      if (!shrank && !clamped && scrollEl.scrollTop < lastTop - 1) {
        stuck.current = false;
        stop();
      } else if (near()) stuck.current = true;
      sync();
    };
    // Intent arrives before the scroll it causes: unstick at once, or a growing answer pins
    // the view back mid-gesture.
    // Only intent that can actually scroll up: no scroll event would follow to re-stick.
    const unstick = (target: EventTarget | null) => {
      if (scrollEl.scrollTop > 0 && !innerScrollsUp(target, scrollEl)) {
        stuck.current = false;
        stop();
      }
    };
    const onWheel = (event: WheelEvent) => {
      if (event.deltaY < 0 && -event.deltaY >= Math.abs(event.deltaX)) unstick(event.target);
    };
    // On the document, after React's root listeners: a widget that handles the key (a menu
    // trigger's ArrowUp) has called preventDefault by then, and the log won't scroll.
    const onKeyDown = (event: KeyboardEvent) => {
      if (
        !event.defaultPrevented &&
        SCROLL_UP_KEYS.has(event.key) &&
        event.target instanceof Node &&
        scrollEl.contains(event.target) &&
        !isEditable(event.target)
      ) {
        unstick(event.target);
      }
    };
    let touchY = 0;
    const onTouchStart = (event: TouchEvent) => {
      touchY = event.touches[0]?.clientY ?? 0;
    };
    // A finger moving down scrolls the log up; moving up at the bottom scrolls nowhere.
    const onTouchMove = (event: TouchEvent) => {
      const y = event.touches[0]?.clientY ?? touchY;
      if (y > touchY) unstick(event.target);
      touchY = y;
    };
    const observer = new ResizeObserver(onResize); // at most once per frame; no rAF needed
    observer.observe(contentEl);
    observer.observe(scrollEl);
    scrollEl.addEventListener('scroll', onScroll, { passive: true });
    scrollEl.addEventListener('wheel', onWheel, { passive: true });
    scrollEl.addEventListener('touchstart', onTouchStart, { passive: true });
    scrollEl.addEventListener('touchmove', onTouchMove, { passive: true });
    const doc = scrollEl.ownerDocument;
    doc.addEventListener('keydown', onKeyDown);
    pin(scrollEl); // a long history opens at the latest message
    sync();
    return () => {
      stop();
      follow.current = null;
      observer.disconnect();
      scrollEl.removeEventListener('scroll', onScroll);
      scrollEl.removeEventListener('wheel', onWheel);
      scrollEl.removeEventListener('touchstart', onTouchStart);
      scrollEl.removeEventListener('touchmove', onTouchMove);
      doc.removeEventListener('keydown', onKeyDown);
    };
  }, [scrollEl, contentEl, threshold]);

  // Sending re-sticks even after the reader scrolled up. Skipped on mount: the effect above
  // already pinned.
  const lastKey = useRef(autoScrollKey);
  useEffect(() => {
    if (Object.is(lastKey.current, autoScrollKey)) return;
    lastKey.current = autoScrollKey;
    stuck.current = true;
    follow.current?.();
  }, [autoScrollKey]);

  /** Re-sticks and glides to the end ('smooth'), or jumps ('auto' / 'instant', reduced motion). */
  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    if (!scrollEl) return;
    stuck.current = true;
    if (behavior === 'smooth') follow.current?.();
    else pin(scrollEl);
  };

  return { isAtBottom, scrollToBottom };
}
