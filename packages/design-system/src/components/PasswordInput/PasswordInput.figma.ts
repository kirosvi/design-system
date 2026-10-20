// url=https://www.figma.com/design/VKb5gW46uSGw0rqrhZsbXT/WADS-Components?node-id=12035-11449
// source=https://github.com/wallarm/design-system/blob/main/packages/design-system/src/components/PasswordInput/PasswordInput.tsx
// component=PasswordInput
import figma from 'figma';

const instance = figma.selectedInstance;
const { renderProp } = figma.helpers.react;

const showRequirements = instance.getEnum('Requirements List', { On: true });

// Field chrome, size, error and placeholder live on the nested `text-input` / `_text-box`.
const inputLayer = instance.findInstance('text-input');
const input = inputLayer.type === 'INSTANCE' ? inputLayer : undefined;
const size = input?.getEnum('Size', { Medium: 'medium', Small: 'small' });
const error = input?.getEnum('Error', { On: true });

// Everything below lives inside the nested `text-input`, so search from that handle.
const boxLayer = input?.findInstance('_text-box');
const box = boxLayer?.type === 'INSTANCE' ? boxLayer : undefined;
const placeholder = box?.getString('Placeholder');
const disabled = box?.getEnum('State', { Disabled: true });

const labelLayer = input?.getBoolean('Label') ? input.findInstance('input-label') : undefined;
const label = labelLayer?.type === 'INSTANCE' ? labelLayer : undefined;
const required = label?.getBoolean('Mandatory') || undefined;
const indicator = required || label?.getBoolean('Optional');
const info = label?.getBoolean('Info');
const actionLayer = input?.getBoolean('Label action')
  ? input.findInstance('_label-action')
  : undefined;
const action = actionLayer?.type === 'INSTANCE' ? actionLayer : undefined;

// `Bottom` holds two `input-description` rows (help text and counter); each one's own `Type`
// decides what it shows. Take the help row, never the counter.
const help = input?.getBoolean('Help text')
  ? input
      .findLayers(n => n.type === 'INSTANCE' && n.name === 'input-description', {
        path: ['Bottom'],
      })
      .map(n => (n.type === 'INSTANCE' ? n : undefined))
      .find(n => n && n.getEnum('Type', { Counter: true }) !== true)
  : undefined;
const helpError = help?.getEnum('Type', { Error: true }) ?? false;

// Requirement rows are private `_password-input-item` instances with plain text labels; map the
// label wording to a PasswordComplexityItemId so reordered/hidden rows keep the right id.
const itemId = (label: string) => {
  const l = label.toLowerCase();
  if (l.includes('upper')) return 'uppercase';
  if (l.includes('lower')) return 'lowercase';
  if (l.includes('number') || l.includes('digit')) return 'number';
  if (l.includes('symbol') || l.includes('special')) return 'symbol';
  if (l.includes('match')) return 'match';
  return 'length';
};
const items = showRequirements
  ? instance
      .findLayers(n => n.type === 'INSTANCE' && n.name === '_password-input-item')
      .map(layer => {
        const item = layer.type === 'INSTANCE' ? layer : undefined;
        const text = item?.findText('text');
        const textContent = text?.type === 'TEXT' ? text.textContent : '';
        const met = item?.getEnum('Checked', { On: true, Off: false }) ?? false;
        return figma.code`
    { id: '${itemId(textContent)}', label: ${JSON.stringify(textContent)}, met: ${met} },`;
      })
  : [];

const field = figma.code`<Field${renderProp('required', required)}>
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
    <FieldAction${renderProp('type', action.getEnum('Type', { Other: 'muted' }))}>${action.getString('Action')}</FieldAction>`
        : ''
    }
  </FieldLabel>
  `
      : ''
  }<PasswordInput${renderProp('size', size)}${placeholder ? renderProp('placeholder', placeholder) : ''}${renderProp('error', error)}${renderProp('disabled', disabled)} />${
    help
      ? helpError
        ? figma.code`
  <FieldError>${help.getString('Error text')}</FieldError>`
        : figma.code`
  <FieldDescription>${help.getString('Description')}</FieldDescription>`
      : ''
  }
</Field>`;

const example = showRequirements
  ? figma.code`<VStack gap={6}>
  ${field}
  <PasswordComplexity
    items={[${items}
    ]}
  />
</VStack>`
  : field;

const fieldImports = [
  'Field',
  ...(label ? ['FieldLabel'] : []),
  ...(indicator ? ['FieldIndicator'] : []),
  ...(action ? ['FieldAction'] : []),
  ...(help ? [helpError ? 'FieldError' : 'FieldDescription'] : []),
].join(', ');

export default {
  id: 'password-input',
  example,
  imports: [
    `import { ${fieldImports} } from '@wallarm-org/design-system/Field';`,
    "import { PasswordInput } from '@wallarm-org/design-system/PasswordInput';",
    ...(info
      ? [
          "import { Tooltip, TooltipContent, TooltipTrigger } from '@wallarm-org/design-system/Tooltip';",
          "import { Info } from '@wallarm-org/design-system/icons';",
        ]
      : []),
    ...(showRequirements
      ? [
          "import { PasswordComplexity } from '@wallarm-org/design-system/PasswordComplexity';",
          "import { VStack } from '@wallarm-org/design-system/Stack';",
        ]
      : []),
  ],
  metadata: { nestable: true },
};
