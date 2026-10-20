// url=https://www.figma.com/design/VKb5gW46uSGw0rqrhZsbXT/WADS-Components?node-id=318-7365
// source=https://github.com/wallarm/design-system/blob/main/packages/design-system/src/components/Badge/Badge.tsx
// component=Badge
import figma from 'figma';

const instance = figma.selectedInstance;

const type = instance.getEnum('Type', {
  Secondary: 'secondary',
  Outline: 'outline',
  Text: 'text',
  'Text-color': 'text-color',
});
const color = instance.getEnum('Style', {
  Cyan: 'cyan',
  Pink: 'pink',
  Rose: 'rose',
  Fuchsia: 'fuchsia',
  Violet: 'violet',
  Blue: 'blue',
  Indigo: 'indigo',
  Green: 'green',
  Sky: 'sky',
  Teal: 'teal',
  Emerald: 'emerald',
  Lime: 'lime',
  Yellow: 'yellow',
  'w-orange': 'w-orange',
  Amber: 'amber',
  Red: 'red',
  Gray: 'gray',
  Zinc: 'zinc',
  Neutral: 'neutral',
  Stone: 'stone',
});
const size = instance.getEnum('Size', { Small: 'small', Large: 'large' });
const textVariant = instance.getEnum('Code', { On: 'code' });
const muted = instance.getEnum('Muted', { On: true });
const variant = instance.getBoolean('Dot') ? 'dotted' : undefined;
const closable = instance.getBoolean('Closable');
const label = instance.getBoolean('Label') ? instance.getString('Name') : '';
const leftIcon = instance.getBoolean('Left icon')
  ? instance.getInstanceSwap('l-ic')?.executeTemplate().example
  : undefined;
const rightIcon = instance.getBoolean('Right icon')
  ? instance.getInstanceSwap('r-ic')?.executeTemplate().example
  : undefined;

const example = figma.code`<Badge${figma.helpers.react.renderProp('variant', variant)}${figma.helpers.react.renderProp('type', type)}${figma.helpers.react.renderProp('color', color)}${figma.helpers.react.renderProp('size', size)}${figma.helpers.react.renderProp('textVariant', textVariant)}${figma.helpers.react.renderProp('muted', muted)}>${
  leftIcon
    ? figma.code`
  ${leftIcon}`
    : ''
}${
  label
    ? figma.code`
  ${label}`
    : ''
}${
  rightIcon
    ? figma.code`
  ${rightIcon}`
    : ''
}${
  closable
    ? figma.code`
  <X size='sm' />`
    : ''
}
</Badge>`;

export default {
  id: 'badge',
  example,
  imports: [
    "import { Badge } from '@wallarm-org/design-system/Badge';",
    ...(closable ? ["import { X } from '@wallarm-org/design-system/icons';"] : []),
  ],
  metadata: { nestable: true },
};
