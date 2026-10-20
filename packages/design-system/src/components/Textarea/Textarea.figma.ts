// url=https://www.figma.com/design/VKb5gW46uSGw0rqrhZsbXT/WADS-Components?node-id=114-1565
// source=https://github.com/wallarm/design-system/blob/main/packages/design-system/src/components/Textarea/Textarea.tsx
// component=Textarea
import figma from 'figma';

const instance = figma.selectedInstance;
const { renderProp } = figma.helpers.react;

const size = instance.getEnum('Size', { Medium: 'medium', Small: 'small' });
const error = instance.getEnum('Error', { On: true });

// Placeholder, filled and disabled state live on the private nested `_area-box`.
const found = instance.findInstance('_area-box');
const box = found.type === 'INSTANCE' ? found : undefined;
const text = box?.getString('Placeholder');
const filled = box?.getEnum('Filled', { On: true });
const disabled = box?.getEnum('State', { Disabled: true });

const labelLayer = instance.getBoolean('Label') ? instance.findInstance('input-label') : undefined;
const label = labelLayer?.type === 'INSTANCE' ? labelLayer : undefined;
const required = label?.getBoolean('Mandatory') || undefined;
const indicator = required || label?.getBoolean('Optional');
const info = label?.getBoolean('Info');
// input-label's own nested input-description (Description=On); Type=Error goes after the control.
const labelDescLayer = label?.getEnum('Description', { On: true })
  ? label.findInstance('input-description')
  : undefined;
const labelDesc = labelDescLayer?.type === 'INSTANCE' ? labelDescLayer : undefined;
const labelDescType = labelDesc?.getEnum('Type', {
  Description: 'FieldDescription',
  Error: 'FieldError',
});
const labelDescCode = labelDesc
  ? figma.code`
  ${labelDesc.executeTemplate().example}`
  : '';
const actionLayer = instance.getBoolean('Label action')
  ? instance.findInstance('_label-action')
  : undefined;
const action = actionLayer?.type === 'INSTANCE' ? actionLayer.getString('Action') : undefined;

// Two `input-description` layers sit in Bottom: help text and the counter (no code equivalent).
const help = instance.getBoolean('Help text')
  ? instance
      .findLayers(node => node.type === 'INSTANCE' && node.name === 'input-description')
      .find(node => node.type === 'INSTANCE' && !node.getEnum('Type', { Counter: true }))
  : undefined;
const helpLayer = help?.type === 'INSTANCE' ? help : undefined;

const example = figma.code`<Field${renderProp('required', required)}${renderProp('invalid', error)}${renderProp('disabled', disabled)}>
  ${
    label
      ? figma.code`<FieldLabel>
    ${label.getString('Input label')}${
      indicator
        ? figma.code`
    <FieldIndicator />`
        : ''
    }${
      info
        ? figma.code`
    <Tooltip>
      <TooltipTrigger>
        <Info />
      </TooltipTrigger>
      <TooltipContent>Additional information</TooltipContent>
    </Tooltip>`
        : ''
    }${
      action
        ? figma.code`
    <FieldAction>${action}</FieldAction>`
        : ''
    }
  </FieldLabel>${labelDescType === 'FieldError' ? '' : labelDescCode}
  `
      : ''
  }<Textarea${renderProp('size', size)}${text ? renderProp(filled ? 'defaultValue' : 'placeholder', text) : ''}${renderProp('error', error)}${renderProp('disabled', disabled)} />${labelDescType === 'FieldError' ? labelDescCode : ''}${
    helpLayer
      ? error
        ? figma.code`
  <FieldError>${helpLayer.getString('Error text')}</FieldError>`
        : figma.code`
  <FieldDescription>${helpLayer.getString('Description')}</FieldDescription>`
      : ''
  }
</Field>`;

const fieldImports = [
  'Field',
  ...(label ? ['FieldLabel'] : []),
  ...(indicator ? ['FieldIndicator'] : []),
  ...(action ? ['FieldAction'] : []),
  ...new Set(
    [labelDescType, helpLayer ? (error ? 'FieldError' : 'FieldDescription') : undefined].filter(
      (t): t is string => !!t,
    ),
  ),
].join(', ');

export default {
  id: 'textarea',
  example,
  imports: [
    `import { ${fieldImports} } from '@wallarm-org/design-system/Field';`,
    "import { Textarea } from '@wallarm-org/design-system/Textarea';",
    ...(info
      ? [
          "import { Tooltip, TooltipContent, TooltipTrigger } from '@wallarm-org/design-system/Tooltip';",
          "import { Info } from '@wallarm-org/design-system/icons';",
        ]
      : []),
  ],
  metadata: { nestable: true },
};
