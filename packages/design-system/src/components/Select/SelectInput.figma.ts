// url=https://www.figma.com/design/VKb5gW46uSGw0rqrhZsbXT/WADS-Components?node-id=122-2222
// source=https://github.com/wallarm/design-system/blob/main/packages/design-system/src/components/Select/SelectInput/SelectInput.tsx
// component=SelectInput
import figma from 'figma';

const instance = figma.selectedInstance;
const { renderProp } = figma.helpers.react;

const size = instance.getEnum('Size', { Medium: 'medium', Small: 'small' });
const error = instance.getEnum('Error', { On: true });

// Placeholder, state and single/multiple live on the private nested `_select-box`.
const found = instance.findInstance('_select-box');
const box = found.type === 'INSTANCE' ? found : undefined;
const placeholder = box?.getString('Placeholder');
const disabled = box?.getEnum('State', { Disabled: true });
const multiple = box?.getEnum('Type', { 'Tag / Badge': true });
const filled = box?.getEnum('Filled', { On: true });

const labelLayer = instance.getBoolean('Label') ? instance.findInstance('input-label') : undefined;
const label = labelLayer?.type === 'INSTANCE' ? labelLayer : undefined;
const required = label?.getBoolean('Mandatory') || undefined;
const indicator = required || label?.getBoolean('Optional');
const actionLayer = instance.getBoolean('Label action')
  ? instance.findInstance('_label-action')
  : undefined;
const action = actionLayer?.type === 'INSTANCE' ? actionLayer.getString('Action') : undefined;

// In the Error=On variant the description layer is always shown and carries the error text.
// Its own template (Field/FieldDescription.figma.ts) renders FieldDescription / FieldError.
// The nested input-label is hand-rendered: its template emits a whole <Field><Input /></Field> block.
const helpLayer =
  error || instance.getBoolean('Help text')
    ? instance.findInstance('input-description')
    : undefined;
const help = helpLayer?.type === 'INSTANCE' ? helpLayer.executeTemplate().example : undefined;

const example = figma.code`const collection = createListCollection({
  items: [
    { label: 'Option 1', value: 'option-1' },
    { label: 'Option 2', value: 'option-2' },
  ],
});

<Field${renderProp('required', required)}${renderProp('invalid', error)}${renderProp('disabled', disabled)}>
  ${
    label
      ? figma.code`<FieldLabel>
    ${label.getString('Input label')}${
      indicator
        ? figma.code`
    <FieldIndicator />`
        : ''
    }${
      action
        ? figma.code`
    <FieldAction>${action}</FieldAction>`
        : ''
    }
  </FieldLabel>
  `
      : ''
  }<FieldContent>
    <Select collection={collection}${renderProp('multiple', multiple)}${
      filled
        ? figma.code` defaultValue={${multiple ? "['option-1', 'option-2']" : "['option-1']"}}`
        : ''
    }>
      <SelectInput${renderProp('size', size)}${renderProp('placeholder', placeholder)} />
      <SelectPositioner>
        <SelectContent>
          {collection.items.map(item => (
            <SelectOption key={item.value} item={item}>
              <SelectOptionText>{item.label}</SelectOptionText>
              <SelectOptionIndicator />
            </SelectOption>
          ))}
        </SelectContent>
      </SelectPositioner>
    </Select>${
      help
        ? figma.code`
    ${help}`
        : ''
    }
  </FieldContent>
</Field>`;

const fieldImports = [
  'Field',
  ...(action ? ['FieldAction'] : []),
  'FieldContent',
  ...(help ? [error ? 'FieldError' : 'FieldDescription'] : []),
  ...(indicator ? ['FieldIndicator'] : []),
  ...(label ? ['FieldLabel'] : []),
].join(', ');

export default {
  id: 'select-input',
  example,
  imports: [
    `import { ${fieldImports} } from '@wallarm-org/design-system/Field';`,
    "import { createListCollection, Select, SelectContent, SelectInput, SelectOption, SelectOptionIndicator, SelectOptionText, SelectPositioner } from '@wallarm-org/design-system/Select';",
  ],
  metadata: { nestable: true },
};
