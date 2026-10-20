// url=https://www.figma.com/design/VKb5gW46uSGw0rqrhZsbXT/WADS-Components?node-id=286-1921
// source=https://github.com/wallarm/design-system/blob/main/packages/design-system/src/components/Checkbox/Checkbox.tsx
// component=Checkbox
import figma from 'figma';

const instance = figma.selectedInstance;

const label = instance.getString('Label');
const description = instance.getBoolean('Description') ? instance.getString('Descript') : undefined;
const info = instance.getBoolean('Info');
const checked = instance.getEnum('Indeterminate', { On: true })
  ? 'indeterminate'
  : instance.getEnum('Selected', { On: true });
const disabled = instance.getEnum('Disabled', { On: true });

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
const body = figma.code`<CheckboxIndicator />
  <CheckboxLabel>${label}${tooltip}</CheckboxLabel>${
    description
      ? figma.code`
  <CheckboxDescription>${description}</CheckboxDescription>`
      : ''
  }`;

// Inside CheckboxGroup the group owns the checked state: CheckboxGroup.figma.ts builds the item
// from these props and assigns a unique value per option.
const slug = label
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-|-$/g, '');

export default {
  id: 'checkbox',
  example: figma.code`<Checkbox${figma.helpers.react.renderProp('checked', checked)}${figma.helpers.react.renderProp('disabled', disabled)}>
  ${body}
</Checkbox>`,
  imports: [
    "import { Checkbox, CheckboxDescription, CheckboxIndicator, CheckboxLabel } from '@wallarm-org/design-system/Checkbox';",
    ...(info
      ? [
          "import { Tooltip, TooltipContent, TooltipTrigger } from '@wallarm-org/design-system/Tooltip';",
          "import { Info } from '@wallarm-org/design-system/icons';",
        ]
      : []),
  ],
  metadata: {
    nestable: true,
    props: {
      body,
      slug,
      disabled: disabled === true,
      checked: checked === true,
      indeterminate: checked === 'indeterminate',
      info,
    },
  },
};
