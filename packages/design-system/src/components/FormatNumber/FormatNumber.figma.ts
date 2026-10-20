// url=https://www.figma.com/design/VKb5gW46uSGw0rqrhZsbXT/WADS-Components?node-id=11925-1963
// source=https://github.com/wallarm/design-system/blob/main/packages/design-system/src/components/FormatNumber/FormatNumber.tsx
// component=FormatNumber
import figma from 'figma';

// The Figma component exposes no properties beyond a single-option Type variant
// and a placeholder text, so the snippet is a static example.
const example = figma.code`<FormatNumber value={12345} unit='requests' />`;

export default {
  id: 'format-number',
  example,
  imports: ["import { FormatNumber } from '@wallarm-org/design-system/FormatNumber';"],
  metadata: { nestable: true },
};
