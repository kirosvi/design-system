// url=https://www.figma.com/design/VKb5gW46uSGw0rqrhZsbXT/WADS-Components?node-id=856-394
// source=https://github.com/wallarm/design-system/blob/main/packages/design-system/src/components/Loader/Loader.tsx
// component=Loader
import figma from 'figma';

const instance = figma.selectedInstance;

const type = instance.getEnum('Type', { Sonner: 'sonner' });
const size = instance.getEnum('Size', {
  sm: 'sm',
  md: 'md',
  lg: 'lg',
  xl: 'xl',
  '2xl': '2xl',
  '3xl': '3xl',
});
const color = instance.getEnum('Style', {
  Primary: 'primary',
  'Primary-alt': 'primary-alt',
  'Primary-alt-fixed': 'primary-alt-fixed',
  Brand: 'brand',
  Destructive: 'danger',
});
const background = type !== 'sonner' && !instance.getBoolean('Background') ? false : undefined;

const example = figma.code`<Loader${figma.helpers.react.renderProp('type', type)}${figma.helpers.react.renderProp('size', size === 'xl' ? undefined : size)}${figma.helpers.react.renderProp('color', color)}${background === false ? figma.code` background={false}` : ''} />`;

export default {
  id: 'loader',
  example,
  imports: ["import { Loader } from '@wallarm-org/design-system/Loader';"],
  metadata: { nestable: true },
};
