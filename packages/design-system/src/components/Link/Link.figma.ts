// url=https://www.figma.com/design/VKb5gW46uSGw0rqrhZsbXT/WADS-Components?node-id=949-2830
// source=https://github.com/wallarm/design-system/blob/main/packages/design-system/src/components/Link/Link.tsx
// component=Link
import figma from 'figma';

const instance = figma.selectedInstance;

const type = instance.getEnum('Type', { Alt: 'alt', Muted: 'muted', Table: 'table' });
const size = instance.getEnum('Size', { xs: 'xs', sm: 'sm', md: 'md', xl: 'xl' });
const weight = instance.getEnum('Medium', { On: 'medium' });
const label = instance.getString('Label');
const newTab = instance.getBoolean('New tab');
const rightIcon = instance.getBoolean('Right icon')
  ? instance.getInstanceSwap('r-ic')?.executeTemplate().example
  : undefined;

const example = figma.code`<Link href='#'${figma.helpers.react.renderProp('type', type)}${figma.helpers.react.renderProp('size', size)}${figma.helpers.react.renderProp('weight', weight)}${newTab ? figma.code` target='_blank' rel='noopener noreferrer'` : ''}>
  ${label}${rightIcon ?? ''}${newTab ? figma.code`<SquareArrowOutUpRight />` : ''}
</Link>`;

export default {
  id: 'link',
  example,
  imports: [
    "import { Link } from '@wallarm-org/design-system/Link';",
    ...(newTab
      ? ["import { SquareArrowOutUpRight } from '@wallarm-org/design-system/icons';"]
      : []),
  ],
  metadata: { nestable: true },
};
