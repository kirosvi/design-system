// url=https://www.figma.com/design/VKb5gW46uSGw0rqrhZsbXT/WADS-Components?node-id=9203-6848
// source=https://github.com/wallarm/design-system/blob/main/packages/design-system/src/components/TreeView/TreeView.tsx
// component=TreeView
import figma from 'figma';

// The only properties are the SLOT props `Slot`/`Slot2` and the single-option archived
// variant `[arc] #`. The slots hold only private `_tree-view-item` rows, which have no
// Code Connect, so `getSlot()` yields no usable TreeViewItem code — the snippet is static
// and mirrors the default rows (folder icon, title, numeric badge).
export default {
  id: 'tree-view',
  example: figma.code`<TreeView>
  <TreeViewItem defaultOpen>
    <Folder />
    Title
    <NumericBadge>1</NumericBadge>
    <TreeViewItem>
      <Folder />
      Title
      <NumericBadge>1</NumericBadge>
    </TreeViewItem>
  </TreeViewItem>
  <TreeViewItem>
    <Folder />
    Title
    <NumericBadge>1</NumericBadge>
  </TreeViewItem>
</TreeView>`,
  imports: [
    "import { TreeView, TreeViewItem } from '@wallarm-org/design-system/TreeView';",
    "import { NumericBadge } from '@wallarm-org/design-system/NumericBadge';",
    "import { Folder } from '@wallarm-org/design-system/icons';",
  ],
  metadata: { nestable: true },
};
