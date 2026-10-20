// url=https://www.figma.com/design/VKb5gW46uSGw0rqrhZsbXT/WADS-Components?node-id=290-3417
// source=https://github.com/wallarm/design-system/blob/main/packages/design-system/src/components/Checkbox/Checkbox.tsx
// component=Checkbox
import figma from 'figma';

const instance = figma.selectedInstance;

const label = instance.getString('Label');
const description = instance.getBoolean('Description') ? instance.getString('Descript') : undefined;
const info = instance.getBoolean('Info');
const checked = instance.getEnum('Selected', { On: true }) === true;
const disabled = instance.getEnum('State', { Disable: true });

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

// The card look has no standalone component: it comes from CheckboxGroup variant='card',
// which also owns the checked state (defaultValue) of its items.
const slug = label
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-|-$/g, '');
const value = slug || 'option';
const body = figma.code`<CheckboxIndicator />
  <CheckboxLabel>${label}${tooltip}</CheckboxLabel>${
    description
      ? figma.code`
  <CheckboxDescription>${description}</CheckboxDescription>`
      : ''
  }`;

export default {
  id: 'checkbox-card',
  example: figma.code`<CheckboxGroup variant='card'${checked ? figma.code` defaultValue={['${value}']}` : ''}>
  <Checkbox value='${value}'${figma.helpers.react.renderProp('disabled', disabled)}>
    ${body}
  </Checkbox>
</CheckboxGroup>`,
  imports: [
    "import { Checkbox, CheckboxDescription, CheckboxGroup, CheckboxIndicator, CheckboxLabel } from '@wallarm-org/design-system/Checkbox';",
    ...(info
      ? [
          "import { Tooltip, TooltipContent, TooltipTrigger } from '@wallarm-org/design-system/Tooltip';",
          "import { Info } from '@wallarm-org/design-system/icons';",
        ]
      : []),
  ],
  metadata: {
    nestable: true,
    props: { body, slug, disabled: disabled === true, checked, indeterminate: false, info },
  },
};
