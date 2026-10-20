// url=https://www.figma.com/design/VKb5gW46uSGw0rqrhZsbXT/WADS-Components?node-id=290-5899
// source=https://github.com/wallarm/design-system/blob/main/packages/design-system/src/components/Radio/RadioGroup.tsx
// component=RadioGroup
import figma from 'figma';

const instance = figma.selectedInstance;

const card = instance.getEnum('Card', { On: 'card' });

// Options are the connected radio-item / radio-card instances in the visible slot.
// Their templates expose plain fields via metadata props; values are assigned here by index
// so they stay unique even when several options share the default 'Label' text.
interface ItemProps {
  label: string;
  description?: string;
  disabled?: boolean;
  checked: boolean;
  info: boolean;
}
const items = (instance.getSlot(card ? 'options2' : 'options')?.connectedInstances ?? []).flatMap(
  (option, i) => {
    const props = option.executeTemplate().metadata?.props as ItemProps | undefined;
    return props ? [{ ...props, value: `option-${i + 1}` }] : [];
  },
);
// Single selection: the first selected option becomes the group's defaultValue.
const selected = items.find(item => item.checked);

// Label / description / error come from the nested input-label and input-description layers.
const labelLayer = instance.findInstance('input-label');
const label = labelLayer.type === 'INSTANCE' ? labelLayer : undefined;
const labelText = label?.getString('Input label') ?? 'Label';
const required = label?.getBoolean('Mandatory') ?? false;
const indicator = required || (label?.getBoolean('Optional') ?? false);
const labelInfo = label?.getBoolean('Info') ?? false;
const descriptionLayer = label?.getEnum('Description', { On: true })
  ? label.findInstance('input-description')
  : undefined;
const description =
  descriptionLayer?.type === 'INSTANCE' ? descriptionLayer.getString('Description') : undefined;
const errorLayer = instance.getBoolean('Error')
  ? instance.findInstance('input-description')
  : undefined;
const error = errorLayer?.type === 'INSTANCE' ? errorLayer.getString('Error text') : undefined;

const tooltip = (indent: string) => figma.code`
${indent}  <Tooltip>
${indent}    <TooltipTrigger>
${indent}      <Info />
${indent}    </TooltipTrigger>
${indent}    <TooltipContent>Additional information</TooltipContent>
${indent}  </Tooltip>`;
const options = items.map(
  item => figma.code`
    <Radio value='${item.value}'${figma.helpers.react.renderProp('disabled', item.disabled)}>
      <RadioIndicator />
      <RadioLabel>${item.label}${
        item.info
          ? figma.code`${tooltip('      ')}
      `
          : ''
      }</RadioLabel>${
        item.description
          ? figma.code`
      <RadioDescription>${item.description}</RadioDescription>`
          : ''
      }
    </Radio>`,
);
const needsTooltip = labelInfo || items.some(item => item.info);

export default {
  id: 'radio-group',
  example: figma.code`<Field${figma.helpers.react.renderProp('required', required)}${figma.helpers.react.renderProp('invalid', error !== undefined)}>
  <FieldLabel>
    ${labelText}${indicator ? figma.code` <FieldIndicator />` : ''}${labelInfo ? tooltip('    ') : ''}
  </FieldLabel>${
    description
      ? figma.code`
  <FieldDescription>${description}</FieldDescription>`
      : ''
  }
  <RadioGroup${figma.helpers.react.renderProp('variant', card)}${selected ? figma.code` defaultValue='${selected.value}'` : ''}>${options}
  </RadioGroup>${
    error
      ? figma.code`
  <FieldError>${error}</FieldError>`
      : ''
  }
</Field>`,
  imports: [
    `import { ${['Radio', ...(items.some(item => item.description) ? ['RadioDescription'] : []), 'RadioGroup', 'RadioIndicator', 'RadioLabel'].join(', ')} } from '@wallarm-org/design-system/Radio';`,
    `import { ${['Field', ...(description ? ['FieldDescription'] : []), ...(error ? ['FieldError'] : []), ...(indicator ? ['FieldIndicator'] : []), 'FieldLabel'].join(', ')} } from '@wallarm-org/design-system/Field';`,
    ...(needsTooltip
      ? [
          "import { Tooltip, TooltipContent, TooltipTrigger } from '@wallarm-org/design-system/Tooltip';",
          "import { Info } from '@wallarm-org/design-system/icons';",
        ]
      : []),
  ],
  metadata: { nestable: true },
};
