// url=https://www.figma.com/design/VKb5gW46uSGw0rqrhZsbXT/WADS-Components?node-id=9881-1705
// source=https://github.com/wallarm/design-system/blob/main/packages/design-system/src/components/Progress/Progress.tsx
// component=Progress
import figma from 'figma';

const instance = figma.selectedInstance;

// Brand is the code default (color='brand'), so it renders no prop.
const color = instance.getEnum('Style', { Brand: undefined });

const example = figma.code`<Progress value={70}${figma.helpers.react.renderProp('color', color)} />`;

export default {
  id: 'progress',
  example,
  imports: ["import { Progress } from '@wallarm-org/design-system/Progress';"],
  metadata: { nestable: true },
};
