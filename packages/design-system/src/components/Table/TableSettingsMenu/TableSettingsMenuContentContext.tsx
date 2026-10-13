import { createContext, useContext } from 'react';

interface TableSettingsMenuContentContextValue {
  search: string;
  setSearch: (value: string) => void;
  /**
   * Visibility held while the menu is open (`deferColumnVisibility`), applied
   * to the table on close. Untouched when not deferring.
   */
  visibilityDraft: VisibilityDraft;
  setVisibilityDraft: (draft: VisibilityDraft) => void;
}

export interface VisibilityDraft {
  /** "Reset to default" was pressed: the draft starts from the default, not the table. */
  fromDefault: boolean;
  /** Per-column toggles on top of that base. */
  toggles: Record<string, boolean>;
}

export const EMPTY_VISIBILITY_DRAFT: VisibilityDraft = { fromDefault: false, toggles: {} };

/**
 * The visibility the draft would leave: the object the same switches and reset
 * would have written one by one without deferral. Toggles that match their base
 * are dropped, so a switch flipped back adds no explicit entry. Both the close
 * (write only when this differs from the current object) and the Reset button
 * (disabled only when this equals the default) read it, so the deferred menu
 * behaves like the immediate one apart from timing.
 */
export const resolveVisibilityDraft = (
  { fromDefault, toggles }: VisibilityDraft,
  current: Record<string, boolean>,
  defaults: Record<string, boolean> | undefined,
): Record<string, boolean> => {
  const base = fromDefault ? (defaults ?? {}) : current;
  const changed = Object.entries(toggles).filter(
    ([id, visible]) => (base[id] !== false) !== visible,
  );
  return changed.length === 0 ? base : { ...base, ...Object.fromEntries(changed) };
};

const TableSettingsMenuContentContext = createContext<TableSettingsMenuContentContextValue | null>(
  null,
);

export const TableSettingsMenuContentProvider = TableSettingsMenuContentContext.Provider;

export const useTableSettingsMenuContentContext = (): TableSettingsMenuContentContextValue => {
  const ctx = useContext(TableSettingsMenuContentContext);
  if (!ctx) {
    throw new Error(
      'TableSettingsMenu item components must be rendered inside <TableSettingsMenu>',
    );
  }
  return ctx;
};
