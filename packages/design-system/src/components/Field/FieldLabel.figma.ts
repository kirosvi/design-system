// url=https://www.figma.com/design/VKb5gW46uSGw0rqrhZsbXT/WADS-Components?node-id=706-12652
// source=https://github.com/wallarm/design-system/blob/main/packages/design-system/src/components/Field/FieldLabel.tsx
// component=FieldLabel
import figma from 'figma';

const { renderProp } = figma.helpers.react;
const instance = figma.selectedInstance;

const label = instance.getString('Input label');
const mandatory = instance.getBoolean('Mandatory');
const optional = instance.getBoolean('Optional');
const info = instance.getBoolean('Info');
const description = instance.getEnum('Description', { Off: false, On: true });

// FieldIndicator renders '*' when the Field is required, '(Optional)' otherwise.
const nested = description ? instance.findInstance('input-description') : undefined;
const nestedDescription = nested && nested.type === 'INSTANCE' ? nested : undefined;
// Nested Type=Error renders FieldError: it goes after the control and needs `invalid` on Field.
const error = nestedDescription?.getEnum('Type', { Error: true }) ?? false;
const help = nestedDescription
  ? figma.code`\n  ${nestedDescription.executeTemplate().example}`
  : '';

export default {
  id: 'field-label',
  example: figma.code`<Field${renderProp('required', mandatory)}${renderProp('invalid', error)}>
  <FieldLabel>
    ${label}${mandatory || optional ? figma.code`\n    <FieldIndicator />` : ''}${
      info
        ? figma.code`\n    <Tooltip>
      <TooltipTrigger>
        <Info />
      </TooltipTrigger>
      <TooltipContent>Additional information</TooltipContent>
    </Tooltip>`
        : ''
    }
  </FieldLabel>${error ? '' : help}
  <Input${renderProp('error', error)} />${error ? help : ''}
</Field>`,
  imports: [
    "import { Field, FieldIndicator, FieldLabel } from '@wallarm-org/design-system/Field';",
    "import { Input } from '@wallarm-org/design-system/Input';",
    "import { Tooltip, TooltipContent, TooltipTrigger } from '@wallarm-org/design-system/Tooltip';",
    "import { Info } from '@wallarm-org/design-system/icons';",
  ],
  // Whole Field block: not meant to be inlined into the ~20 input templates that nest input-label.
  metadata: { nestable: false },
};
