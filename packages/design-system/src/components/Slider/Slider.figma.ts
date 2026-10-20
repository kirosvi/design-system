// url=https://www.figma.com/design/VKb5gW46uSGw0rqrhZsbXT/WADS-Components?node-id=11354-181
// source=https://github.com/wallarm/design-system/blob/main/packages/design-system/src/components/Slider/Slider.tsx
// component=Slider
import figma from 'figma';

const instance = figma.selectedInstance;
const { renderProp } = figma.helpers.react;

// Range is the value's length (one SliderThumb per entry), not a prop.
const range = instance.getEnum('Double', { On: true });
const ticks = instance.getEnum('Ticks', { On: true });
const input = instance.getEnum('Input', { On: true });

// One `_handle` per thumb, each with its own Tooltip variant.
const tooltips = instance
  .findLayers(node => node.type === 'INSTANCE' && node.name === '_handle')
  .map(node => (node.type === 'INSTANCE' ? node.getEnum('Tooltip', { On: true }) : undefined));

// Ticks → SliderMarks from the `_tick` labels. Labels are a numeric scale only when they parse
// and strictly ascend; otherwise they spread evenly over 0–100.
const tickLabels = ticks
  ? instance
      .findLayers(node => node.type === 'INSTANCE' && node.name === '_tick')
      .map(node => (node.type === 'INSTANCE' ? node.getString('Value') : ''))
  : [];
const labels = tickLabels.length >= 2 ? tickLabels : [];
const nums = labels.map(label => (label.trim() === '' ? Number.NaN : Number(label)));
const numeric =
  nums.length >= 2 &&
  nums.every((n, i) => Number.isFinite(n) && (i === 0 || n > (nums[i - 1] ?? n)));
const values = numeric
  ? nums
  : labels.map((_, i) => Math.round((i * 100) / Math.max(labels.length - 1, 1)));
const min = values[0] ?? 0;
const max = values[values.length - 1] ?? 100;
// Step only when every gap is equal (marks and snapping agree); otherwise keep the default 1.
const gaps = values.slice(1).map((v, i) => v - (values[i] ?? v));
const step = gaps.length > 0 && gaps.every(gap => gap === gaps[0]) ? gaps[0] : 1;
const quote = (s: string) => s.replace(/\\/g, '\\\\').replace(/'/g, "\\'");

const thumb = (index?: number) =>
  figma.code`<SliderThumb${index === undefined ? '' : figma.code` index={${index}}`}${renderProp('tooltip', tooltips[index ?? 0] || undefined)} />`;

const markList = labels
  .map((label, i) => `{ value: ${values[i]}, label: '${quote(label)}' }`)
  .join(',\n        ');

const control = figma.code`<SliderControl>
    ${
      range
        ? figma.code`${thumb(0)}
    ${thumb(1)}`
        : thumb()
    }${
      labels.length > 0
        ? figma.code`
    <SliderMarks
      marks={[
        ${markList},
      ]}
    />`
        : ''
    }
  </SliderControl>`;

const rangeDefault = labels.length > 0 ? `[${min}, ${max}]` : '[20, 80]';

const example = figma.code`<Slider${min !== 0 ? figma.code` min={${min}}` : ''}${max !== 100 ? figma.code` max={${max}}` : ''}${step !== 1 ? figma.code` step={${step}}` : ''}${range ? figma.code` defaultValue={${rangeDefault}}` : ''}>${
  input && range
    ? figma.code`
  <SliderInput index={0} />`
    : ''
}
  ${control}${
    input
      ? figma.code`
  <SliderInput${range ? figma.code` index={1}` : ''} />`
      : ''
  }
</Slider>`;

const parts = [
  'Slider',
  'SliderControl',
  ...(input ? ['SliderInput'] : []),
  ...(labels.length > 0 ? ['SliderMarks'] : []),
  'SliderThumb',
];

export default {
  id: 'slider',
  example,
  imports: [`import { ${parts.join(', ')} } from '@wallarm-org/design-system/Slider';`],
  metadata: { nestable: true },
};
