// url=https://www.figma.com/design/VKb5gW46uSGw0rqrhZsbXT/WADS-Components?node-id=1666-10180
// source=https://github.com/wallarm/design-system/blob/main/packages/design-system/src/components/Overlay/Overlay.tsx
// component=Overlay
import figma from 'figma';

const example = figma.code`<Overlay />`;

export default {
  id: 'overlay',
  example,
  imports: ["import { Overlay } from '@wallarm-org/design-system/Overlay';"],
  metadata: { nestable: true },
};
