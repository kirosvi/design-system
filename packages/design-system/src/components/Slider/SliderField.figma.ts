// url=https://www.figma.com/design/VKb5gW46uSGw0rqrhZsbXT/WADS-Components?node-id=11358-1807
// source=https://github.com/wallarm/design-system/blob/main/packages/design-system/src/components/Slider/Slider.tsx
// component=Slider
import figma from 'figma';

const instance = figma.selectedInstance;
const { renderProp } = figma.helpers.react;

// No dedicated component: the "slider-input" field is the Field composition around Slider.
const error = instance.getEnum('Error', { On: true });

const labelLayer = instance.getBoolean('Label') ? instance.findInstance('input-label') : undefined;
const label = labelLayer?.type === 'INSTANCE' ? labelLayer : undefined;
const required = label?.getBoolean('Mandatory') || undefined;
const indicator = required || label?.getBoolean('Optional');
const info = label?.getBoolean('Info');

const helpLayer = instance.getBoolean('Help text')
  ? instance.findInstance('input-description')
  : undefined;
const help = helpLayer?.type === 'INSTANCE' ? helpLayer : undefined;

// The nested `slider` is read here with the same logic as Slider.figma.ts (templates can't share
// code), so its Ticks / Input / handle Tooltip survive in the controlled variant too.
const sliderLayer = instance.findInstance('slider');
const nested = sliderLayer.type === 'INSTANCE' ? sliderLayer : undefined;
const range = nested?.getEnum('Double', { On: true });
const input = nested?.getEnum('Input', { On: true });
const tooltips = (
  nested?.findLayers(node => node.type === 'INSTANCE' && node.name === '_handle') ?? []
).map(node => (node.type === 'INSTANCE' ? node.getEnum('Tooltip', { On: true }) : undefined));
const tickLabels = nested?.getEnum('Ticks', { On: true })
  ? nested
      .findLayers(node => node.type === 'INSTANCE' && node.name === '_tick')
      .map(node => (node.type === 'INSTANCE' ? node.getString('Value') : ''))
  : [];
const labels = tickLabels.length >= 2 ? tickLabels : [];
const nums = labels.map(l => (l.trim() === '' ? Number.NaN : Number(l)));
const numeric =
  nums.length >= 2 &&
  nums.every((n, i) => Number.isFinite(n) && (i === 0 || n > (nums[i - 1] ?? n)));
const values = numeric
  ? nums
  : labels.map((_, i) => Math.round((i * 100) / Math.max(labels.length - 1, 1)));
const min = values[0] ?? 0;
const max = values[values.length - 1] ?? 100;
const gaps = values.slice(1).map((v, i) => v - (values[i] ?? v));
const step = gaps.length > 0 && gaps.every(gap => gap === gaps[0]) ? gaps[0] : 1;
const quote = (s: string) => s.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
const rangeDefault = labels.length > 0 ? `[${min}, ${max}]` : '[20, 80]';

// Label value → the live value beside the label (controlled value; SliderValue only reads
// slider context, so it can't sit in the label row).
const showValue = instance.getBoolean('Label value');

const labelNode = label
  ? figma.code`<FieldLabel>
    ${label.getString('Input label')}${
      indicator
        ? figma.code`
    <FieldIndicator />`
        : ''
    }${
      info
        ? figma.code`
    <Tooltip>
      <TooltipTrigger>
        <Info />
      </TooltipTrigger>
      <TooltipContent>Additional information</TooltipContent>
    </Tooltip>`
        : ''
    }
  </FieldLabel>`
  : undefined;

const header =
  labelNode && showValue
    ? figma.code`<div className='flex w-full items-center justify-between'>
    ${labelNode}
    <span className='text-sm font-medium text-text-primary tabular-nums'>{${range ? "value.join(' – ')" : 'value[0]'}}</span>
  </div>
  `
    : labelNode
      ? figma.code`${labelNode}
  `
      : '';

const thumb = (index?: number) =>
  figma.code`<SliderThumb${index === undefined ? '' : figma.code` index={${index}}`}${renderProp('tooltip', tooltips[index ?? 0] || undefined)} />`;

const markList = labels
  .map((l, i) => `{ value: ${values[i]}, label: '${quote(l)}' }`)
  .join(',\n          ');

const slider = figma.code`<Slider${min !== 0 ? figma.code` min={${min}}` : ''}${max !== 100 ? figma.code` max={${max}}` : ''}${step !== 1 ? figma.code` step={${step}}` : ''}${
  showValue
    ? figma.code` value={value} onValueChange={setValue}`
    : range
      ? figma.code` defaultValue={${rangeDefault}}`
      : ''
}>${
  input && range
    ? figma.code`
    <SliderInput index={0} />`
    : ''
}
    <SliderControl>
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
    </SliderControl>${
      input
        ? figma.code`
    <SliderInput${range ? figma.code` index={1}` : ''} />`
        : ''
    }
  </Slider>`;

const initial =
  labels.length > 0 ? (range ? rangeDefault : `[${min}]`) : range ? '[20, 80]' : '[50]';

const example = figma.code`${
  showValue
    ? figma.code`// const [value, setValue] = useState(${initial});
`
    : ''
}<Field${renderProp('required', required)}${renderProp('invalid', error)}>
  ${header}${slider}${
    help
      ? error
        ? figma.code`
  <FieldError>${help.getString('Error text')}</FieldError>`
        : figma.code`
  <FieldDescription>${help.getString('Description')}</FieldDescription>`
      : ''
  }
</Field>`;

const fieldImports = [
  'Field',
  ...(help ? [error ? 'FieldError' : 'FieldDescription'] : []),
  ...(indicator ? ['FieldIndicator'] : []),
  ...(label ? ['FieldLabel'] : []),
].join(', ');

const sliderImports = [
  'Slider',
  'SliderControl',
  ...(input ? ['SliderInput'] : []),
  ...(labels.length > 0 ? ['SliderMarks'] : []),
  'SliderThumb',
].join(', ');

export default {
  id: 'slider-field',
  example,
  imports: [
    `import { ${fieldImports} } from '@wallarm-org/design-system/Field';`,
    `import { ${sliderImports} } from '@wallarm-org/design-system/Slider';`,
    ...(info
      ? [
          "import { Tooltip, TooltipContent, TooltipTrigger } from '@wallarm-org/design-system/Tooltip';",
          "import { Info } from '@wallarm-org/design-system/icons';",
        ]
      : []),
  ],
  metadata: { nestable: true },
};
