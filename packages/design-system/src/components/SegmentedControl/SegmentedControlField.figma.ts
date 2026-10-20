// url=https://www.figma.com/design/VKb5gW46uSGw0rqrhZsbXT/WADS-Components?node-id=666-2355
// source=https://github.com/wallarm/design-system/blob/main/packages/design-system/src/components/SegmentedControl/SegmentedControl.tsx
// component=SegmentedControl
import figma from 'figma';

const instance = figma.selectedInstance;

// No dedicated code component: this is a Field composition around a connected segmented-control.
const control = instance.findInstance('segmented-control');
const controlExample =
  control.type === 'INSTANCE' ? control.executeTemplate().example : '<SegmentedControl />';
const usesMore = control.type === 'INSTANCE' && control.getBoolean('More pills');

const labelLayer = instance.getBoolean('Label') ? instance.findInstance('input-label') : undefined;
const label = labelLayer?.type === 'INSTANCE' ? labelLayer : undefined;
const labelText = label?.getString('Input label') ?? '';
const required = label?.getBoolean('Mandatory') ?? false;
const indicator = required || (label?.getBoolean('Optional') ?? false);
const labelInfo = label?.getBoolean('Info') ?? false;

// Label Description=On nests an input-description (93:48, connected via Field/FieldDescription.figma.ts).
const labelDescLayer = label?.getEnum('Description', { On: true })
  ? label.findInstance('input-description')
  : undefined;
const labelDesc = labelDescLayer?.type === 'INSTANCE' ? labelDescLayer : undefined;
const labelDescIsError = labelDesc?.getEnum('Type', { Error: true }) ?? false;

// Field-level layer: direct child only, so the label's nested input-description is not picked up.
const errorChild = instance.getBoolean('Error')
  ? instance.children.find(child => child.type === 'INSTANCE' && child.name === 'input-description')
  : undefined;
const errorLayer = errorChild?.type === 'INSTANCE' ? errorChild : undefined;
const fieldError = errorLayer?.getEnum('Type', { Error: true }) ?? false;

// Help text before the control; FieldError (and Type=Counter placeholder) after it.
const before = labelDesc && !labelDescIsError ? [labelDesc] : [];
const after = [
  ...(labelDesc && labelDescIsError ? [labelDesc] : []),
  ...(errorLayer ? [errorLayer] : []),
];
const invalid = labelDescIsError || fieldError;
const usesDescription = [labelDesc, errorLayer].some(
  layer => layer?.getEnum('Type', { Description: true }) ?? false,
);
const render = (layers: typeof before) =>
  layers.map(
    layer => figma.code`
  ${layer.executeTemplate().example}`,
  );

const tooltip = figma.code`
    <Tooltip>
      <TooltipTrigger>
        <Info />
      </TooltipTrigger>
      <TooltipContent>Additional information</TooltipContent>
    </Tooltip>`;

export default {
  id: 'segmented-control-field',
  example: figma.code`<Field${figma.helpers.react.renderProp('required', required)}${figma.helpers.react.renderProp('invalid', invalid)}>${
    label
      ? figma.code`
  <FieldLabel>
    ${labelText}${indicator ? figma.code` <FieldIndicator />` : ''}${labelInfo ? tooltip : ''}
  </FieldLabel>`
      : ''
  }${render(before)}
  ${controlExample}${render(after)}
</Field>`,
  imports: [
    `import { Field${label ? ', FieldLabel' : ''}${indicator ? ', FieldIndicator' : ''}${usesDescription ? ', FieldDescription' : ''}${invalid ? ', FieldError' : ''} } from '@wallarm-org/design-system/Field';`,
    `import { SegmentedControl, SegmentedControlItem${usesMore ? ', SegmentedControlButton, SegmentedControlSeparator' : ''} } from '@wallarm-org/design-system/SegmentedControl';`,
    ...(labelInfo
      ? [
          "import { Tooltip, TooltipContent, TooltipTrigger } from '@wallarm-org/design-system/Tooltip';",
          "import { Info } from '@wallarm-org/design-system/icons';",
        ]
      : []),
  ],
  metadata: { nestable: true },
};
