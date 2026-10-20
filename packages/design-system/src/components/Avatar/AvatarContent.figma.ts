// url=https://www.figma.com/design/VKb5gW46uSGw0rqrhZsbXT/WADS-Components?node-id=12557-5856
// source=https://github.com/wallarm/design-system/blob/main/packages/design-system/src/components/Avatar/AvatarContent.tsx
// component=AvatarContent
import figma from 'figma';

const instance = figma.selectedInstance;

const size = instance.getEnum('Size', { Small: 'sm', Medium: 'md' });
const nameLayer = instance.findText('Artem Miskevich');
const name = nameLayer.type === 'TEXT' ? nameLayer.textContent : 'Artem Miskevich';
// The nested user-avatar's Type decides photo vs initials; its own template emits a whole <Avatar>, so read the variant only.
const nested = instance.findInstance('user-avatar');
const type =
  nested.type === 'INSTANCE'
    ? nested.getEnum('Type', { Photo: 'photo', Nuetral: 'neutral', Branded: 'branded' })
    : 'photo';

const image =
  type === 'photo'
    ? figma.code`<AvatarImage src='/me.png' />
  `
    : '';

// Branded is not a prop: the plate takes the brand colour inside a data-frame-style='branded' frame.
const example =
  type === 'branded'
    ? figma.code`<div data-frame-style='branded'>
  <Avatar size='${size}'>
    <AvatarFallback name='${name}' />
    <AvatarContent>
      <AvatarName>${name}</AvatarName>
    </AvatarContent>
  </Avatar>
</div>`
    : figma.code`<Avatar size='${size}'>
  ${image}<AvatarFallback name='${name}' />
  <AvatarContent>
    <AvatarName>${name}</AvatarName>
  </AvatarContent>
</Avatar>`;

export default {
  id: 'avatar-content',
  example,
  imports: [
    "import { Avatar, AvatarContent, AvatarFallback, AvatarImage, AvatarName } from '@wallarm-org/design-system/Avatar';",
  ],
  metadata: { nestable: true },
};
