import figma from '@figma/code-connect';
import { Avatar, AvatarContent, AvatarFallback, AvatarImage, AvatarName } from '.';

// WADS Components → user-avatar. Props: Size (Small | Medium) and Type (Photo | Nuetral | Branded —
// Figma's spelling). Branded is not a prop in code: the plate turns brand inside a
// `data-frame-style='branded'` frame, so it maps to the same code as Nuetral.
const AVATAR_URL =
  'https://www.figma.com/design/VKb5gW46uSGw0rqrhZsbXT/WADS-Components?node-id=12336-5504';

// WADS Components → user-item: avatar + name. Prop: Size (Small | Medium).
const USER_ITEM_URL =
  'https://www.figma.com/design/VKb5gW46uSGw0rqrhZsbXT/WADS-Components?node-id=12557-5856';

figma.connect(Avatar, AVATAR_URL, {
  variant: { Type: 'Photo' },
  props: { size: figma.enum('Size', { Small: 'sm', Medium: 'md' }) },
  example: ({ size }) => (
    <Avatar size={size}>
      <AvatarImage src='/me.png' />
      <AvatarFallback name='Ada Lovelace' />
    </Avatar>
  ),
});

figma.connect(Avatar, AVATAR_URL, {
  variant: { Type: 'Nuetral' },
  props: { size: figma.enum('Size', { Small: 'sm', Medium: 'md' }) },
  example: ({ size }) => (
    <Avatar size={size}>
      <AvatarFallback />
    </Avatar>
  ),
});

figma.connect(Avatar, AVATAR_URL, {
  variant: { Type: 'Branded' },
  props: { size: figma.enum('Size', { Small: 'sm', Medium: 'md' }) },
  example: ({ size }) => (
    <Avatar size={size}>
      <AvatarFallback />
    </Avatar>
  ),
});

figma.connect(Avatar, USER_ITEM_URL, {
  props: { size: figma.enum('Size', { Small: 'sm', Medium: 'md' }) },
  example: ({ size }) => (
    <Avatar size={size}>
      <AvatarImage src='/me.png' />
      <AvatarFallback name='Artem Miskevich' />
      <AvatarContent>
        <AvatarName>Artem Miskevich</AvatarName>
      </AvatarContent>
    </Avatar>
  ),
});
