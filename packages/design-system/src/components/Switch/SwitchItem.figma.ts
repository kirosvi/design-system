// url=https://www.figma.com/design/VKb5gW46uSGw0rqrhZsbXT/WADS-Components?node-id=290-8267
// source=https://github.com/wallarm/design-system/blob/main/packages/design-system/src/components/Switch/Switch.tsx
// component=Switch
import figma from 'figma';

const instance = figma.selectedInstance;

const label = instance.getString('Label');
const description = instance.getBoolean('Description') ? instance.getString('Descript') : undefined;
const info = instance.getBoolean('Info');
const checked = instance.getEnum('Selected', { On: true });
const disabled = instance.getEnum('State', { Disable: true });
// a11y lives on the nested `switch` instance, not on the item.
const control = instance.findInstance('switch');
const a11yMode = control.type === 'INSTANCE' ? control.getBoolean('a11y') : undefined;

// Figma has no info prop: the "i" next to the label is a Tooltip composition in code.
const labelElement = info
  ? figma.code`<SwitchLabel>
    ${label}{' '}
    <Tooltip>
      <TooltipTrigger>
        <Info />
      </TooltipTrigger>
      <TooltipContent>Additional information</TooltipContent>
    </Tooltip>
  </SwitchLabel>`
  : figma.code`<SwitchLabel>${label}</SwitchLabel>`;

export default {
  id: 'switch-item',
  example: figma.code`<Switch${figma.helpers.react.renderProp('checked', checked)}${figma.helpers.react.renderProp('disabled', disabled)}${figma.helpers.react.renderProp('a11yMode', a11yMode)}>
  <SwitchControl />
  ${labelElement}${
    description
      ? figma.code`
  <SwitchDescription>${description}</SwitchDescription>`
      : ''
  }
</Switch>`,
  imports: [
    `import { Switch, SwitchControl, SwitchLabel${description ? ', SwitchDescription' : ''} } from '@wallarm-org/design-system/Switch';`,
    ...(info
      ? [
          "import { Tooltip, TooltipContent, TooltipTrigger } from '@wallarm-org/design-system/Tooltip';",
          "import { Info } from '@wallarm-org/design-system/icons';",
        ]
      : []),
  ],
  metadata: { nestable: true },
};
