// url=https://www.figma.com/design/VKb5gW46uSGw0rqrhZsbXT/WADS-Components?node-id=5542-37417
// source=https://github.com/wallarm/design-system/blob/main/packages/design-system/src/components/Table/TableSettingsMenu/TableSettingsMenu.tsx
// component=TableSettingsMenu
import figma from 'figma';

// Table shows this menu automatically once it gets onColumnVisibilityChange or
// onColumnOrderChange. Search, column items (incl. the Pinned group) and Reset
// are generated from table state; a <TableSettingsMenu> child only overrides
// it. 'Type' has no prop.
const example = figma.code`<Table
  data={data}
  columns={columns}
  columnVisibility={columnVisibility}
  onColumnVisibilityChange={setColumnVisibility}
  columnOrder={columnOrder}
  onColumnOrderChange={setColumnOrder}
/>`;

export default {
  id: 'table-settings-menu',
  example,
  imports: ["import { Table } from '@wallarm-org/design-system/Table';"],
  metadata: { nestable: false },
};
