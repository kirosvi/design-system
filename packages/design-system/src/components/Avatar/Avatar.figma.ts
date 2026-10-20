// url=https://www.figma.com/design/VKb5gW46uSGw0rqrhZsbXT/WADS-Components?node-id=12336-5504
// source=https://github.com/wallarm/design-system/blob/main/packages/design-system/src/components/Avatar/Avatar.tsx
// component=Avatar
import figma from 'figma';

const instance = figma.selectedInstance;

const size = instance.getEnum('Size', { Small: 'sm', Medium: 'md' });
const type = instance.getEnum('Type', { Photo: 'photo', Nuetral: 'neutral', Branded: 'branded' });
// Nuetral/Branded variants draw an initial from the 'First letter' layer; Photo has none.
const letter = instance.findText('First letter');
const name = letter.type === 'TEXT' ? letter.textContent : 'Ada Lovelace';

// Branded is not a prop: the plate takes the brand colour inside a data-frame-style='branded' frame.
const example =
  type === 'photo'
    ? figma.code`<Avatar size='${size}'>
  <AvatarImage src='/me.png' />
  <AvatarFallback name='${name}' />
</Avatar>`
    : type === 'branded'
      ? figma.code`<div data-frame-style='branded'>
  <Avatar size='${size}'>
    <AvatarFallback name='${name}' />
  </Avatar>
</div>`
      : figma.code`<Avatar size='${size}'>
  <AvatarFallback name='${name}' />
</Avatar>`;

export default {
  id: 'avatar',
  example,
  imports: [
    "import { Avatar, AvatarFallback, AvatarImage } from '@wallarm-org/design-system/Avatar';",
  ],
  metadata: { nestable: true },
};
