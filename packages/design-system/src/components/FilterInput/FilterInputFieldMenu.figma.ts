// url=https://www.figma.com/design/VKb5gW46uSGw0rqrhZsbXT/WADS-Components?node-id=5937-2749
// source=https://github.com/wallarm/design-system/blob/main/packages/design-system/src/components/FilterInput/FilterInputMenu/FilterInputFieldMenu/FilterInputFieldMenu.tsx
// component=FilterInputFieldMenu
import figma from 'figma';

const instance = figma.selectedInstance;

const searched = instance.getEnum('Type', { Searched: true });

const example = figma.code`<FilterInputFieldMenu
  fields={fields}${
    searched
      ? figma.code`
  filterText={searchText}`
      : ''
  }
  open={open}
  onOpenChange={setOpen}
  onSelect={handleSelect}
  onEscape={() => setOpen(false)}
  positioning={positioning}
/>`;

export default {
  id: 'filter-input-field-menu',
  example,
  imports: ["import { FilterInputFieldMenu } from '@wallarm-org/design-system/FilterInput';"],
  metadata: { nestable: true },
};
