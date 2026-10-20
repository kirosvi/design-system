// url=https://www.figma.com/design/VKb5gW46uSGw0rqrhZsbXT/WADS-Components?node-id=314-10573
// source=https://github.com/wallarm/design-system/blob/main/packages/design-system/src/components/Separator/Separator.tsx
// component=Separator
import figma from 'figma';

const instance = figma.selectedInstance;

const orientation = instance.getEnum('Orientation', {
  Vertical: 'vertical',
  Horizontal: undefined,
});

const example = figma.code`<Separator${figma.helpers.react.renderProp('orientation', orientation)} />`;

export default {
  id: 'separator',
  example,
  imports: ["import { Separator } from '@wallarm-org/design-system/Separator';"],
  metadata: { nestable: true },
};
