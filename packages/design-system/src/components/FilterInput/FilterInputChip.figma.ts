// url=https://www.figma.com/design/VKb5gW46uSGw0rqrhZsbXT/WADS-Components?node-id=5922-21018
// source=https://github.com/wallarm/design-system/blob/main/packages/design-system/src/components/FilterInput/FilterInputField/FilterInputChip/FilterInputChip.tsx
// component=FilterInputChip
import figma from 'figma';

const instance = figma.selectedInstance;

// AND / OR / ( / ) are connector chips: FilterInput renders them internally
// from the expression tree; FilterInputConnectorChip is not exported.
const isChip = instance.getEnum('Type', { Chip: true }) ?? false;

const segmentText = (layer: string, fallback: string) => {
  const segment = instance.findInstance(layer);
  if (segment.type !== 'INSTANCE') return fallback;
  const label = segment.findText('Label');
  return label.type === 'TEXT' ? label.textContent : fallback;
};

const error = instance.getEnum('Validation', { On: true });
const disabled = instance.getEnum('State', { Disable: true });

const example = isChip
  ? figma.code`<FilterInputChip${figma.helpers.react.renderProp('attribute', segmentText('_segment-attribute', 'Attribute'))}${figma.helpers.react.renderProp('operator', segmentText('_segment-operator', 'is'))}${figma.helpers.react.renderProp(
      'value',
      // Layer name is load-bearing: the `_segment-value` instance is named 'Frame 36'
      // in Figma (the template API exposes no main-component name to match on).
      segmentText('Frame 36', 'Value'),
    )}${figma.helpers.react.renderProp('error', error)}${figma.helpers.react.renderProp('disabled', disabled)}
  onRemove={handleRemove}
/>`
  : figma.code`{/* AND / OR / parenthesis chips are rendered internally by FilterInput from its expression value — no public component */}
<FilterInput fields={fields} value={expression} onChange={setExpression} />`;

export default {
  id: 'filter-input-chip',
  example,
  imports: [
    isChip
      ? "import { FilterInputChip } from '@wallarm-org/design-system/FilterInput';"
      : "import { FilterInput } from '@wallarm-org/design-system/FilterInput';",
  ],
  metadata: { nestable: true },
};
