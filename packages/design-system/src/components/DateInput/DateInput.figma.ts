// url=https://www.figma.com/design/VKb5gW46uSGw0rqrhZsbXT/WADS-Components?node-id=2055-8168
// source=https://github.com/wallarm/design-system/blob/main/packages/design-system/src/components/DateInput/DateInput.tsx
// component=DateInput
import figma from 'figma';

const instance = figma.selectedInstance;
const { renderProp } = figma.helpers.react;

const size = instance.getEnum('Size', { Medium: 'medium', Small: 'small' });
const error = instance.getEnum('Error', { On: true });

// Placeholder, icons and state live on the private nested `_datetime-box`.
// The same Figma node draws TimeInput (clock icon only) and a date+time DateInput.
const box = instance.findInstance('_datetime-box');
const isBox = box.type === 'INSTANCE';
const dateIcon = isBox ? box.getBoolean('Date ic') : true;
const clockIcon = isBox && box.getBoolean('Clock ic');
const disabled = isBox ? box.getEnum('State', { Disabled: true }) : undefined;
const isTime = clockIcon && !dateIcon;
const granularity = dateIcon && clockIcon ? 'minute' : undefined;
// The 'Placeholder' layer shows the typed value when Filled=On; the Figma default
// text is left out so the code's format-based default placeholder applies.
const filled = isBox && box.getEnum('Filled', { On: true });
const placeholderText = isBox && !filled ? box.getString('Placeholder') : '';
const placeholder = placeholderText !== 'Select a date' ? placeholderText : '';

const labelLayer = instance.getBoolean('Label') ? instance.findInstance('input-label') : undefined;
const label = labelLayer?.type === 'INSTANCE' ? labelLayer : undefined;
const required = label?.getBoolean('Mandatory') || undefined;
const indicator = required || label?.getBoolean('Optional');
const info = label?.getBoolean('Info');
// `_label-action` only renders inside FieldLabel in code.
const actionLayer =
  label && instance.getBoolean('Label action') ? instance.findInstance('_label-action') : undefined;
const action = actionLayer?.type === 'INSTANCE' ? actionLayer.getString('Action') : undefined;

const helpLayer = instance.getBoolean('Help text')
  ? instance.findInstance('input-description')
  : undefined;
const help = helpLayer?.type === 'INSTANCE' ? helpLayer : undefined;
const helpIsError = help?.getEnum('Type', { Error: true });

const Input = isTime ? 'TimeInput' : 'DateInput';

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
  </FieldLabel>
  `
      : ''
  }<${Input}${renderProp('size', size)}${renderProp('granularity', granularity)}${dateIcon || clockIcon ? '' : ' showIcon={false}'}${renderProp('placeholder', placeholder)}${renderProp('isRequired', required)}${renderProp('error', error)}${renderProp('disabled', disabled)} />${
    help
      ? figma.code`
  ${help.executeTemplate().example}`
      : ''
  }
</Field>`;

const fieldImports = [
  'Field',
  ...(label ? ['FieldLabel'] : []),
  ...(indicator ? ['FieldIndicator'] : []),
  ...(action ? ['FieldAction'] : []),
  ...(help ? [helpIsError ? 'FieldError' : 'FieldDescription'] : []),
].join(', ');

export default {
  id: 'date-input',
  example,
  imports: [
    `import { ${fieldImports} } from '@wallarm-org/design-system/Field';`,
    isTime
      ? "import { TimeInput } from '@wallarm-org/design-system/TimeInput';"
      : "import { DateInput } from '@wallarm-org/design-system/DateInput';",
    ...(info
      ? [
          "import { Tooltip, TooltipContent, TooltipTrigger } from '@wallarm-org/design-system/Tooltip';",
          "import { Info } from '@wallarm-org/design-system/icons';",
        ]
      : []),
  ],
  metadata: { nestable: true },
};
