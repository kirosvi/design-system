// url=https://www.figma.com/design/VKb5gW46uSGw0rqrhZsbXT/WADS-Components?node-id=5936-34572
// source=https://github.com/wallarm/design-system/blob/main/packages/design-system/src/components/FilterInput/FilterInputMenu/FilterInputOperatorMenu.tsx
// component=FilterInputOperatorMenu
import figma from 'figma';

const instance = figma.selectedInstance;

const fieldType = instance.getEnum('Type', {
  Boolean: 'boolean',
  String: 'string',
  Date: 'date',
  Enum: 'enum',
  // Number: FieldType also has 'float' (same operator set); 'integer' is shown.
  Number: 'integer',
  // No 'ip' FieldType in code: IP fields use string operators.
  IP: 'string',
});

const example = figma.code`<FilterInputOperatorMenu${figma.helpers.react.renderProp('fieldType', fieldType ?? 'string')}
  open={open}
  onOpenChange={setOpen}
  onSelect={handleSelect}
  onEscape={() => setOpen(false)}
  positioning={positioning}
/>`;

export default {
  id: 'filter-input-operator-menu',
  example,
  imports: ["import { FilterInputOperatorMenu } from '@wallarm-org/design-system/FilterInput';"],
  metadata: { nestable: true },
};
