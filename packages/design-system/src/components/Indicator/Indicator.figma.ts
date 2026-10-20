// url=https://www.figma.com/design/VKb5gW46uSGw0rqrhZsbXT/WADS-Components?node-id=4858-17834
// source=https://github.com/wallarm/design-system/blob/main/packages/design-system/src/components/Indicator/Indicator.tsx
// component=Indicator
import figma from 'figma';

const instance = figma.selectedInstance;

// Code defaults: color='info', size='sm' — undefined omits the prop.
const color = instance.getEnum('Type', {
  Info: undefined,
  Barnd: 'brand',
  Warning: 'warning',
  Success: 'success',
  AI: 'ai',
  Danger: 'danger',
});
const size = instance.getEnum('Size', {
  Medium: undefined,
  Large: 'md',
});

const example = figma.code`<Indicator${figma.helpers.react.renderProp('color', color)}${figma.helpers.react.renderProp('size', size)} />`;

export default {
  id: 'indicator',
  example,
  imports: ["import { Indicator } from '@wallarm-org/design-system/Indicator';"],
  metadata: { nestable: true },
};
