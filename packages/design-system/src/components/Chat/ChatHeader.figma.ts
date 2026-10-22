// url=https://www.figma.com/design/bsqgrzkpIB2yPVlNpgU8jN/Wally-%E2%80%94-AI-Assistnat?node-id=44-1464
// source=https://github.com/wallarm/design-system/blob/main/packages/design-system/src/components/Chat/ChatHeader.tsx
// component=ChatHeader
import figma from 'figma';

const instance = figma.selectedInstance;

// Default (2:42) is the "Ask Wally" title; Variant2 (44:1465) adds the "/" joint and a thread
// Select, plus a New chat action. The actions are plain ghost Buttons composed by the app.
const isThread = instance.getEnum('Property 1', { Default: false, Variant2: true });

const title = isThread
  ? figma.code`<ChatHeaderTitle>
    <Select collection={threads}>
      <SelectButton variant='ghost' size='small' placeholder='New chat' />
      <SelectPositioner>{/* thread options */}</SelectPositioner>
    </Select>
  </ChatHeaderTitle>`
  : figma.code`<ChatHeaderTitle />`;

const newChat = isThread
  ? figma.code`
    <Button variant='ghost' color='neutral' size='small' aria-label='New chat'>
      <Plus />
    </Button>
    <Separator orientation='vertical' />`
  : '';

const example = figma.code`<ChatHeader>
  ${title}
  <ChatHeaderActions>${newChat}
    <Button variant='ghost' color='neutral' size='small' aria-label='Chat history'>
      <History />
    </Button>
    <Button variant='ghost' color='neutral' size='small' aria-label='More actions'>
      <Ellipsis />
    </Button>
    <Separator orientation='vertical' />
    <Button variant='ghost' color='neutral' size='small' aria-label='Close chat'>
      <X />
    </Button>
  </ChatHeaderActions>
</ChatHeader>`;

export default {
  id: 'chat-header',
  example,
  imports: [
    "import { ChatHeader, ChatHeaderActions, ChatHeaderTitle } from '@wallarm-org/design-system/Chat';",
    "import { Button } from '@wallarm-org/design-system/Button';",
    "import { Separator } from '@wallarm-org/design-system/Separator';",
    "import { Select, SelectButton, SelectPositioner } from '@wallarm-org/design-system/Select';",
    "import { Ellipsis, History, Plus, X } from '@wallarm-org/design-system/icons';",
  ],
  metadata: { nestable: true },
};
