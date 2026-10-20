// url=https://www.figma.com/design/VKb5gW46uSGw0rqrhZsbXT/WADS-Components?node-id=4715-3890
// source=https://github.com/wallarm/design-system/blob/main/packages/design-system/src/components/Table/TableActionBar/TableActionBar.tsx
// component=TableActionBar
import figma from 'figma';

const instance = figma.selectedInstance;

// Default 'X selected' is computed from row selection; a custom Counter text or
// Links off needs an explicit TableActionBarSelection override.
const counter = instance.getString('Counter');
const hasCustomCounter = counter !== 'X selected';
const hasLinks = instance.getBoolean('Links');
const actions = instance.getSlot('actions-bulk-bar');

const count = hasCustomCounter
  ? figma.code`<BulkBarSummaryCount>${counter}</BulkBarSummaryCount>`
  : figma.code`<BulkBarSummaryCount />`;
const links = hasLinks
  ? figma.code`
    <BulkBarSummarySelectAll />
    <BulkBarSummarySeparator />
    <BulkBarSummaryClear />`
  : '';
const hasOverride = hasCustomCounter || !hasLinks;
const selection = hasOverride
  ? figma.code`
  <TableActionBarSelection>
    ${count}${links}
  </TableActionBarSelection>`
  : '';

const example = figma.code`<TableActionBar>${selection}
  ${actions}
</TableActionBar>`;

const names = [
  'TableActionBar',
  ...(hasOverride ? ['BulkBarSummaryCount', 'TableActionBarSelection'] : []),
  ...(hasOverride && hasLinks
    ? ['BulkBarSummaryClear', 'BulkBarSummarySelectAll', 'BulkBarSummarySeparator']
    : []),
].sort();

export default {
  id: 'table-action-bar',
  example,
  imports: [`import { ${names.join(', ')} } from '@wallarm-org/design-system/Table';`],
  metadata: { nestable: true },
};
