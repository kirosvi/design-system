// url=https://www.figma.com/design/VKb5gW46uSGw0rqrhZsbXT/WADS-Components?node-id=205-4282
// source=https://github.com/wallarm/design-system/blob/main/packages/design-system/src/components/Checkbox/CheckboxIndicator.tsx
// component=CheckboxIndicator
import figma from 'figma';

const instance = figma.selectedInstance;

// Selected / Indeterminate / disabled live on the Checkbox root, not on the indicator.
const checked = instance.getEnum('Indeterminate', { On: true })
  ? 'indeterminate'
  : instance.getEnum('Selected', { On: true });
const disabled = instance.getEnum('State', { Disable: true });

// Indicator-only checkbox (e.g. Table row selection): the accessible name is left to the consumer —
// aria-label on Checkbox lands on the wrapping <label>, not on the hidden input, so it would not name it.

export default {
  id: 'checkbox-indicator',
  example: figma.code`<Checkbox${figma.helpers.react.renderProp('checked', checked)}${figma.helpers.react.renderProp('disabled', disabled)}>
  <CheckboxIndicator />
</Checkbox>`,
  imports: ["import { Checkbox, CheckboxIndicator } from '@wallarm-org/design-system/Checkbox';"],
  metadata: { nestable: true },
};
