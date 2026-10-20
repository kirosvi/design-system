// url=https://www.figma.com/design/VKb5gW46uSGw0rqrhZsbXT/WADS-Components?node-id=1202-4044
// source=https://github.com/wallarm/design-system/blob/main/packages/design-system/src/components/Tag/Tag.tsx
// component=Tag
import figma from 'figma';

const instance = figma.selectedInstance;
const { renderProp } = figma.helpers.react;

const size = instance.getEnum('Size', { Large: 'large' });
const disabled = instance.getEnum('State', { Disabled: true });
const closable = instance.getEnum('Closable', { On: true, Off: false });
const hasLeftIcon = instance.getEnum('Left icon', { On: true, Off: false });
// Selectable=On is the Select trigger tag (SelectButtonTag) — Closable is replaced by its chevron.
const selectable = instance.getEnum('Selectable', { On: true, Off: false });

// Label and left icon live on the nested badge instance.
const badge = instance.findInstance('badge');
const label = badge.type === 'INSTANCE' ? badge.getString('Name') : 'Tag';
const leftIcon =
  hasLeftIcon && badge.type === 'INSTANCE'
    ? badge.getInstanceSwap('l-ic')?.executeTemplate().example
    : undefined;
const icon = leftIcon
  ? figma.code`${leftIcon}
    `
  : '';

const example = selectable
  ? figma.code`<Select collection={collection}${renderProp('disabled', disabled)}>
  <SelectButtonTag${renderProp('size', size)}>
    ${icon}<SelectButtonTagValue placeholder='${label}' />
  </SelectButtonTag>
  <SelectPositioner>
    <SelectContent>
      {collection.items.map(item => (
        <SelectOption key={item.value} item={item}>
          <SelectOptionText>{item.label}</SelectOptionText>
        </SelectOption>
      ))}
    </SelectContent>
  </SelectPositioner>
</Select>`
  : figma.code`<Tag${renderProp('size', size)}${renderProp('disabled', disabled)}>
  ${
    leftIcon
      ? figma.code`${leftIcon}
  `
      : ''
  }${label}${
    closable
      ? figma.code`
  <TagClose />`
      : ''
  }
</Tag>`;

export default {
  id: 'tag',
  example,
  imports: [
    selectable
      ? "import { Select, SelectButtonTag, SelectButtonTagValue, SelectContent, SelectOption, SelectOptionText, SelectPositioner } from '@wallarm-org/design-system/Select';"
      : closable
        ? "import { Tag, TagClose } from '@wallarm-org/design-system/Tag';"
        : "import { Tag } from '@wallarm-org/design-system/Tag';",
  ],
  metadata: { nestable: true },
};
