// url=https://www.figma.com/design/VKb5gW46uSGw0rqrhZsbXT/WADS-Components?node-id=56-1561
// source=https://github.com/wallarm/design-system/blob/main/packages/design-system/src/components/NumericBadge/NumericBadge.tsx
// component=NumericBadge
import figma from 'figma';

const instance = figma.selectedInstance;

const type = instance.getEnum('Type', {
  Solid: 'solid',
  Secondary: 'secondary',
  Outline: 'outline',
});
const color = instance.getEnum('Color', {
  Neutral: 'neutral',
  'Neutral-alt': 'neutral-alt',
  Brand: 'brand',
  Danger: 'danger',
  Info: 'info',
  Success: 'success',
});
// Code default color depends on type: solid -> brand, otherwise neutral.
const defaultColor = type === 'solid' ? 'brand' : 'neutral';
const size = instance.getEnum('Size', { Small: 'small' });
const count = instance.getString('#');

const example = figma.code`<NumericBadge${figma.helpers.react.renderProp('type', type === 'secondary' ? undefined : type)}${figma.helpers.react.renderProp('color', color === defaultColor ? undefined : color)}${figma.helpers.react.renderProp('size', size)}>
  ${count}
</NumericBadge>`;

export default {
  id: 'numeric-badge',
  example,
  imports: ["import { NumericBadge } from '@wallarm-org/design-system/NumericBadge';"],
  metadata: { nestable: true },
};
