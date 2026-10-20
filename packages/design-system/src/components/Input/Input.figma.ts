// url=https://www.figma.com/design/VKb5gW46uSGw0rqrhZsbXT/WADS-Components?node-id=94-3065
// source=https://github.com/wallarm/design-system/blob/main/packages/design-system/src/components/Input/Input.tsx
// component=Input
import figma from 'figma';

const instance = figma.selectedInstance;
const { renderProp } = figma.helpers.react;

const size = instance.getEnum('Size', { Medium: 'medium', Small: 'small' });
const error = instance.getEnum('Error', { On: true });

// Placeholder, state, addons and icons live on the private nested `_text-box`.
const found = instance.findInstance('_text-box');
const box = found.type === 'INSTANCE' ? found : undefined;
const text = box?.getString('Placeholder');
const filled = box?.getEnum('Filled', { On: true });
const disabled = box?.getEnum('State', { Disabled: true });

// Prefix/Suffix are `_pre-suffix` instances told apart by their own Type variant.
// Content=Numeric/Select have no InputGroup equivalent.
let hasText = false;
const preSuffix = (type: 'Prefix' | 'Suffix') => {
  if (!box?.getBoolean(type)) return undefined;
  const layer = box
    .findLayers(node => node.type === 'INSTANCE' && node.name === '_pre-suffix')
    .find(node => node.type === 'INSTANCE' && node.getEnum('Type', { [type]: true }));
  if (layer?.type !== 'INSTANCE') return undefined;
  const content = layer.getEnum('Content', { Text: 'text', Icon: 'icon' });
  if (content === 'icon') {
    return layer.findConnectedInstances(() => true)[0]?.executeTemplate().example;
  }
  if (content !== 'text') return undefined;
  const label = layer.findText('text');
  if (label.type !== 'TEXT') return undefined;
  hasText = true;
  return figma.code`<InputGroupText>${label.textContent}</InputGroupText>`;
};

const icon = (on: string, swap: string) =>
  box?.getBoolean(on) ? box.getInstanceSwap(swap)?.executeTemplate().example : undefined;

const kbdLayer = box?.getBoolean('Keyboard input') ? box.findInstance('keyboard-input') : undefined;

const start = [preSuffix('Prefix'), icon('Left icon', 'Left ic')].filter(Boolean);
const end = [
  icon('Right icon', 'Right ic'),
  kbdLayer?.type === 'INSTANCE' ? kbdLayer.executeTemplate().example : undefined,
  preSuffix('Suffix'),
].filter(Boolean);
const grouped = start.length > 0 || end.length > 0;
// Interpolating an array concatenates its items; put each addon child on its own line.
const lines = (items: unknown[]) =>
  items.reduce(
    (acc, item) => figma.code`${acc}
      ${item}`,
  );

const labelLayer = instance.getBoolean('Label') ? instance.findInstance('input-label') : undefined;
const label = labelLayer?.type === 'INSTANCE' ? labelLayer : undefined;
const required = label?.getBoolean('Mandatory') || undefined;
const indicator = required || label?.getBoolean('Optional');
const info = label?.getBoolean('Info');
// input-label's own nested input-description (Description=On); Type=Error goes after the control.
const labelDescLayer = label?.getEnum('Description', { On: true })
  ? label.findInstance('input-description')
  : undefined;
const labelDesc = labelDescLayer?.type === 'INSTANCE' ? labelDescLayer : undefined;
const labelDescType = labelDesc?.getEnum('Type', {
  Description: 'FieldDescription',
  Error: 'FieldError',
});
const actionLayer = instance.getBoolean('Label action')
  ? instance.findInstance('_label-action')
  : undefined;
const action = actionLayer?.type === 'INSTANCE' ? actionLayer.getString('Action') : undefined;

const helpLayer = instance.getBoolean('Help text')
  ? instance.findInstance('input-description')
  : undefined;
const help = helpLayer?.type === 'INSTANCE' ? helpLayer : undefined;
// The help instance's own Type decides which text is visible; FieldDescription.figma.ts renders it.
const helpType = help?.getEnum('Type', { Description: 'FieldDescription', Error: 'FieldError' });
const labelDescBefore =
  labelDesc && labelDescType !== 'FieldError'
    ? figma.code`
  ${labelDesc.executeTemplate().example}`
    : '';
const after = [
  ...(labelDesc && labelDescType === 'FieldError' ? [labelDesc] : []),
  ...(help ? [help] : []),
].map(
  layer => figma.code`
  ${layer.executeTemplate().example}`,
);

const input = figma.code`<Input${renderProp('size', size)}${text ? renderProp(filled ? 'defaultValue' : 'placeholder', text) : ''}${renderProp('error', error)}${renderProp('disabled', disabled)} />`;

const control = grouped
  ? figma.code`<InputGroup${renderProp('size', size)}>${
      start.length > 0
        ? figma.code`
    <InputGroupAddon>
      ${lines(start)}
    </InputGroupAddon>`
        : ''
    }
    ${input}${
      end.length > 0
        ? figma.code`
    <InputGroupAddon align='inline-end'>
      ${lines(end)}
    </InputGroupAddon>`
        : ''
    }
  </InputGroup>`
  : input;

const example = figma.code`<Field${renderProp('required', required)}${renderProp('invalid', error)}${renderProp('disabled', disabled)}>
  ${
    label
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
    }${
      action
        ? figma.code`
    <FieldAction>${action}</FieldAction>`
        : ''
    }
  </FieldLabel>${labelDescBefore}
  `
      : ''
  }${control}${after.length > 0 ? after : ''}
</Field>`;

const fieldImports = [
  'Field',
  ...(label ? ['FieldLabel'] : []),
  ...(indicator ? ['FieldIndicator'] : []),
  ...(action ? ['FieldAction'] : []),
  ...new Set([labelDescType, helpType].filter((t): t is string => !!t)),
].join(', ');

const groupImports = ['InputGroup', 'InputGroupAddon', ...(hasText ? ['InputGroupText'] : [])];

export default {
  id: 'input',
  example,
  imports: [
    `import { ${fieldImports} } from '@wallarm-org/design-system/Field';`,
    "import { Input } from '@wallarm-org/design-system/Input';",
    ...(grouped
      ? [`import { ${groupImports.join(', ')} } from '@wallarm-org/design-system/InputGroup';`]
      : []),
    ...(info
      ? [
          "import { Tooltip, TooltipContent, TooltipTrigger } from '@wallarm-org/design-system/Tooltip';",
          "import { Info } from '@wallarm-org/design-system/icons';",
        ]
      : []),
  ],
  metadata: { nestable: true },
};
