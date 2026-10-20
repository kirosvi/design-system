// url=https://www.figma.com/design/VKb5gW46uSGw0rqrhZsbXT/WADS-Components?node-id=316-12699
// source=https://github.com/wallarm/design-system/blob/main/packages/design-system/src/components/Select/SelectButton.tsx
// component=SelectButton
import figma from 'figma';

const instance = figma.selectedInstance;
const { renderProp } = figma.helpers.react;

const variant = instance.getEnum('Type', { Ghost: 'ghost', Secondary: 'secondary' });
const color = instance.getEnum('Color', { Brand: 'brand', 'Neutral-alt': 'neutral-alt' });
const size = instance.getEnum('Size', { Medium: 'medium', Small: 'small' });
const loading = instance.getEnum('State', { Loading: true });
const disabled = instance.getEnum('State', { Disabled: true });
const isTag = instance.getEnum('Content', { 'Badge/Tag': true });

// Content=Badge/Tag maps to SelectButtonTag. Its nested `badge` text is the field label; the part
// before ':' becomes the placeholder (SelectButtonTagValue renders `${placeholder}: ${value}`).
const badge = isTag ? instance.findInstance('badge') : undefined;
const tagLabel =
  badge?.type === 'INSTANCE' ? (badge.getString('Name').split(':')[0] ?? '').trim() : 'Label';

const trigger = isTag
  ? figma.code`<SelectButtonTag>
    <SelectButtonTagValue placeholder='${tagLabel}' />
  </SelectButtonTag>`
  : figma.code`<SelectButton${renderProp('variant', variant)}${renderProp('color', color)}${renderProp('size', size)}${renderProp('placeholder', instance.getString('Name'))} />`;

// SelectButtonTag has no loading state, so State=Loading is dropped in the tag branch.
const example = figma.code`const collection = createListCollection({
  items: [
    { label: 'Option 1', value: 'option-1' },
    { label: 'Option 2', value: 'option-2' },
  ],
});

<Select collection={collection}${renderProp('loading', isTag ? undefined : loading)}${renderProp('disabled', disabled)}>
  ${trigger}
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
</Select>`;

export default {
  id: 'select-button',
  example,
  imports: [
    `import { createListCollection, Select, ${isTag ? 'SelectButtonTag, SelectButtonTagValue' : 'SelectButton'}, SelectContent, SelectOption, SelectOptionIndicator, SelectOptionText, SelectPositioner } from '@wallarm-org/design-system/Select';`,
  ],
  metadata: { nestable: true },
};
