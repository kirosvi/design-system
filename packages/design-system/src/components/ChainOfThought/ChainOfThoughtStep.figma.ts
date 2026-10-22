// url=https://www.figma.com/design/bsqgrzkpIB2yPVlNpgU8jN/Wally-%E2%80%94-AI-Assistnat?node-id=201-1660
// source=https://github.com/wallarm/design-system/blob/main/packages/design-system/src/components/ChainOfThought/ChainOfThoughtStep.tsx
// component=ChainOfThoughtStep
import figma from 'figma';

const instance = figma.selectedInstance;

const type = instance.getEnum('Type', {
  Nested: 'nested',
  Simple: 'simple',
  Working: 'working',
  'Simple-result': 'simple-result',
});
const open = instance.getEnum('Expanded', { Off: undefined, On: true });
const label = instance.getString('Chain item');

// Only Nested rows show the type icon (Ic); Simple rows pass icon={null}.
// State=Hover (chevron swap) is CSS.
const swap = instance.getInstanceSwap('Ic');
const icon =
  type !== 'nested'
    ? figma.code` icon={null}`
    : swap?.type === 'INSTANCE' && swap.hasCodeConnect()
      ? figma.code` icon={${swap.executeTemplate().example}}`
      : figma.code` icon={<CircleDashed />}`;
const metric = type === 'simple-result' || type === 'working' ? figma.code` metric='Metric'` : '';
const status = type === 'working' ? figma.code` status='running'` : '';

const example =
  type === 'nested'
    ? figma.code`<ChainOfThoughtStep${icon} label='${label}'${figma.helpers.react.renderProp('defaultOpen', open)}>
  {/* nested ChainOfThought or rich text */}
</ChainOfThoughtStep>`
    : figma.code`<ChainOfThoughtStep${icon} label='${label}'${metric}${status} />`;

export default {
  id: 'chain-item',
  example,
  imports: [
    "import { ChainOfThoughtStep } from '@wallarm-org/design-system/ChainOfThought';",
    "import { CircleDashed } from '@wallarm-org/design-system/icons';",
  ],
  metadata: { nestable: true },
};
