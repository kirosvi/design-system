// url=https://www.figma.com/design/VKb5gW46uSGw0rqrhZsbXT/WADS-Components?node-id=8404-127175
// source=https://github.com/wallarm/design-system/blob/main/packages/design-system/src/components/FormatDateTime/FormatDateTime.tsx
// component=FormatDateTime
import figma from 'figma';

const instance = figma.selectedInstance;

// Figma texts are preformatted strings; code formats a single `value` itself.
const format = instance.getEnum('Type', {
  'Only date': 'date',
  '2 lines': 'datetime',
  'One line': 'datetime',
});
const layout = instance.getEnum('Type', { 'One line': 'inline' });

const example = figma.code`<FormatDateTime value='2026-01-01T11:00:00'${figma.helpers.react.renderProp('format', format)}${figma.helpers.react.renderProp('layout', layout)} />`;

export default {
  id: 'format-date-time',
  example,
  imports: ["import { FormatDateTime } from '@wallarm-org/design-system/FormatDateTime';"],
  metadata: { nestable: true },
};
