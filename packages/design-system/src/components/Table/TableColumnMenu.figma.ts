// url=https://www.figma.com/design/VKb5gW46uSGw0rqrhZsbXT/WADS-Components?node-id=5352-61785
// source=https://github.com/wallarm/design-system/blob/main/packages/design-system/src/components/Table/TableColumnMenu/TableColumnMenu.tsx
// component=TableColumnMenu
import figma from 'figma';

// TableHeadCell renders this menu by default; write it in a column's `header`
// render only to customize items. 'Property 1' (Pin / Unpin) follows the
// column's pinning state — no prop.
const example = figma.code`const header: TableColumnDef<Row>['header'] = ({ column }) => (
  <>
    <TableSortTrigger column={column}>Name</TableSortTrigger>
    <TableColumnMenu column={column}>
      <TableColumnMenuMoveLeftItem />
      <TableColumnMenuMoveRightItem />
      <TableColumnMenuSortItem direction='asc' />
      <TableColumnMenuSortItem direction='desc' />
      <TableColumnMenuPinItem />
      <TableColumnMenuHideItem />
    </TableColumnMenu>
  </>
);`;

export default {
  id: 'table-column-menu',
  example,
  imports: [
    "import type { TableColumnDef } from '@wallarm-org/design-system/Table';",
    "import { TableColumnMenu, TableColumnMenuHideItem, TableColumnMenuMoveLeftItem, TableColumnMenuMoveRightItem, TableColumnMenuPinItem, TableColumnMenuSortItem, TableSortTrigger } from '@wallarm-org/design-system/Table';",
  ],
  metadata: { nestable: true },
};
