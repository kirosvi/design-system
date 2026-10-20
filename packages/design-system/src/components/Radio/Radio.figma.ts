// url=https://www.figma.com/design/VKb5gW46uSGw0rqrhZsbXT/WADS-Components?node-id=290-5732
// source=https://github.com/wallarm/design-system/blob/main/packages/design-system/src/components/Radio/Radio.tsx
// component=Radio
import figma from 'figma';

const instance = figma.selectedInstance;

const label = instance.getString('Label');
const description = instance.getBoolean('Description') ? instance.getString('Descript') : undefined;
const info = instance.getBoolean('Info');
const checked = instance.getEnum('Selected', { On: true }) === true;
const disabled = instance.getEnum('Disable', { On: true });

// Figma has no info prop: the "i" next to the label is a Tooltip composition in code.
const tooltip = info
  ? figma.code`
      <Tooltip>
        <TooltipTrigger>
          <Info />
        </TooltipTrigger>
        <TooltipContent>Additional information</TooltipContent>
      </Tooltip>
    `
  : '';

// A Radio only works inside a RadioGroup, which owns the selected value (defaultValue).
// Standalone single-option snippet; RadioGroup.figma.ts assigns unique values to grouped options.
const value =
  label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || 'option';

export default {
  id: 'radio',
  example: figma.code`<RadioGroup${checked ? figma.code` defaultValue='${value}'` : ''}>
  <Radio value='${value}'${figma.helpers.react.renderProp('disabled', disabled)}>
    <RadioIndicator />
    <RadioLabel>${label}${tooltip}</RadioLabel>${
      description
        ? figma.code`
    <RadioDescription>${description}</RadioDescription>`
        : ''
    }
  </Radio>
</RadioGroup>`,
  imports: [
    description
      ? "import { Radio, RadioDescription, RadioGroup, RadioIndicator, RadioLabel } from '@wallarm-org/design-system/Radio';"
      : "import { Radio, RadioGroup, RadioIndicator, RadioLabel } from '@wallarm-org/design-system/Radio';",
    ...(info
      ? [
          "import { Tooltip, TooltipContent, TooltipTrigger } from '@wallarm-org/design-system/Tooltip';",
          "import { Info } from '@wallarm-org/design-system/icons';",
        ]
      : []),
  ],
  metadata: { nestable: true, props: { label, description, disabled, checked, info } },
};
