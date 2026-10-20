// url=https://www.figma.com/design/VKb5gW46uSGw0rqrhZsbXT/WADS-Components?node-id=10542-3499
// source=https://github.com/wallarm/design-system/blob/main/packages/design-system/src/components/InputOTP/OTPInput.tsx
// component=OTPInput
import figma from 'figma';

const instance = figma.selectedInstance;
const { renderProp } = figma.helpers.react;

const error = instance.getEnum('Error', { On: true });
// 'Description' boolean is not bound to any layer in Figma (dead property): intentionally unmapped.

// Grouping lives on the private nested `_otp-box` (verified on the canvas): "3x2" = 3 groups of 2
// (code default), "2ч3" (sic, typo for 2x3) = 2 groups of 3, "1x6" = one ungrouped row.
const box = instance.findInstance('_otp-box');
const groupSize =
  box.type === 'INSTANCE' ? box.getEnum('Layout', { '2ч3': 3, '1x6': 0 }) : undefined;

const labelLayer = instance.getBoolean('Label') ? instance.findInstance('input-label') : undefined;
const label = labelLayer?.type === 'INSTANCE' ? labelLayer : undefined;
const required = label?.getBoolean('Mandatory') || undefined;
const indicator = required || label?.getBoolean('Optional');
const info = label?.getBoolean('Info');
// `_label-action` only renders inside FieldLabel in code. Its Type=Other has no agreed
// FieldAction `type`, so it falls back to the default link style (same as sibling templates).
const actionLayer =
  label && instance.getBoolean('Label action') ? instance.findInstance('_label-action') : undefined;
const action = actionLayer?.type === 'INSTANCE' ? actionLayer.getString('Action') : undefined;

// `Bottom` also holds a hidden, unbound `input-description` duplicate; the bound one comes first,
// and handles expose no visibility to filter on.
const helpLayer = instance.getBoolean('Help text')
  ? instance.findInstance('input-description')
  : undefined;
const help = helpLayer?.type === 'INSTANCE' ? helpLayer : undefined;

const otp = figma.code`<OTPInput${renderProp('groupSize', groupSize)}${renderProp('error', error)} />`;

const example =
  label || help
    ? figma.code`<Field${renderProp('required', required)}${renderProp('invalid', error)}>
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
  }${otp}${
    help
      ? error
        ? figma.code`
  <FieldError>${help.getString('Error text')}</FieldError>`
        : figma.code`
  <FieldDescription>${help.getString('Description')}</FieldDescription>`
      : ''
  }
</Field>`
    : otp;

const fieldImports = [
  'Field',
  ...(label ? ['FieldLabel'] : []),
  ...(indicator ? ['FieldIndicator'] : []),
  ...(action ? ['FieldAction'] : []),
  ...(help ? [error ? 'FieldError' : 'FieldDescription'] : []),
].join(', ');

export default {
  id: 'otp-input',
  example,
  imports: [
    ...(label || help
      ? [`import { ${fieldImports} } from '@wallarm-org/design-system/Field';`]
      : []),
    "import { OTPInput } from '@wallarm-org/design-system/InputOTP';",
    ...(info
      ? [
          "import { Tooltip, TooltipContent, TooltipTrigger } from '@wallarm-org/design-system/Tooltip';",
          "import { Info } from '@wallarm-org/design-system/icons';",
        ]
      : []),
  ],
  metadata: { nestable: true },
};
