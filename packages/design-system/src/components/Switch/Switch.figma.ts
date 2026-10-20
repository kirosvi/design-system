// url=https://www.figma.com/design/VKb5gW46uSGw0rqrhZsbXT/WADS-Components?node-id=290-8254
// source=https://github.com/wallarm/design-system/blob/main/packages/design-system/src/components/Switch/Switch.tsx
// component=Switch
import figma from 'figma';

const instance = figma.selectedInstance;

const checked = instance.getEnum('Selected', { On: true });
const disabled = instance.getEnum('State', { Disable: true });
const a11yMode = instance.getBoolean('a11y');

// A bare switch has no visible label: a visually hidden SwitchLabel names the input
// (aria-label on the root <label> does not reach Ark's hidden input). Replace the text.
export default {
  id: 'switch',
  example: figma.code`<Switch${figma.helpers.react.renderProp('checked', checked)}${figma.helpers.react.renderProp('disabled', disabled)}${figma.helpers.react.renderProp('a11yMode', a11yMode)}>
  <SwitchControl />
  <SwitchLabel className='sr-only'>Toggle</SwitchLabel>
</Switch>`,
  imports: [
    "import { Switch, SwitchControl, SwitchLabel } from '@wallarm-org/design-system/Switch';",
  ],
  metadata: { nestable: true },
};
