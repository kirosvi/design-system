// url=https://www.figma.com/design/VKb5gW46uSGw0rqrhZsbXT/WADS-Components?node-id=93-48
// source=https://github.com/wallarm/design-system/blob/main/packages/design-system/src/components/Field/FieldDescription.tsx
// component=FieldDescription
import figma from 'figma';

const instance = figma.selectedInstance;

// Type=Counter has no code equivalent; the snippet says so instead of faking help text.
const type = instance.getEnum('Type', {
  Description: 'description',
  Error: 'error',
  Counter: 'counter',
});

const example =
  type === 'error'
    ? figma.code`<FieldError>${instance.getString('Error text')}</FieldError>`
    : type === 'counter'
      ? figma.code`{/* character counter: no DS equivalent */}`
      : figma.code`<FieldDescription>${instance.getString('Description')}</FieldDescription>`;

export default {
  id: 'field-description',
  example,
  imports: ["import { FieldDescription, FieldError } from '@wallarm-org/design-system/Field';"],
  metadata: { nestable: true },
};
