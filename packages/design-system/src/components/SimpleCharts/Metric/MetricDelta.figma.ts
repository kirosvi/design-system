// url=https://www.figma.com/design/VKb5gW46uSGw0rqrhZsbXT/WADS-Components?node-id=9667-11330
// source=https://github.com/wallarm/design-system/blob/main/packages/design-system/src/components/SimpleCharts/Metric/MetricDelta.tsx
// component=MetricDelta
import figma from 'figma';

const instance = figma.selectedInstance;

const sentiment = instance.getEnum('Type', {
  Positive: 'positive',
  Negative: 'negative',
  Neutral: undefined,
});
// Spelled out explicitly, as in the stories (trend and sentiment are independent axes).
const trend = instance.getEnum('Diff', { Increase: 'up', Decrease: 'down' });
const label = instance.findText('Label', { traverseInstances: true });
// Chip text is a magnitude; the code prop is a number. Fall back to 10 (the Figma default)
// only when there is no parseable number — a real '0' stays 0.
const digits = label.type === 'TEXT' ? label.textContent.replace(/[^\d.]/g, '') : '';
const parsed = Number(digits);
const value = digits !== '' && !Number.isNaN(parsed) ? parsed : 10;

const example = figma.code`<MetricDelta value={${String(value)}}${figma.helpers.react.renderProp('trend', trend)}${figma.helpers.react.renderProp('sentiment', sentiment)} />`;

export default {
  id: 'metric-delta',
  example,
  imports: ["import { MetricDelta } from '@wallarm-org/design-system/SimpleCharts';"],
  metadata: { nestable: true },
};
