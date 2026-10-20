// url=https://www.figma.com/design/VKb5gW46uSGw0rqrhZsbXT/WADS-Components?node-id=5454-23069
// source=https://github.com/wallarm/design-system/blob/main/packages/design-system/src/components/Skeleton/Skeleton.tsx
// component=Skeleton
import figma from 'figma';

const instance = figma.selectedInstance;

// renderProp drops `false`, so emit transparent={false} explicitly.
const opaque = instance.getEnum('Transparent', { On: false, Off: true });

const example = figma.code`<Skeleton width='100%' height='20px'${opaque ? ' transparent={false}' : ''} />`;

export default {
  id: 'skeleton',
  example,
  imports: ["import { Skeleton } from '@wallarm-org/design-system/Skeleton';"],
  metadata: { nestable: true },
};
