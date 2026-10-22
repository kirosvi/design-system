// url=https://www.figma.com/design/bsqgrzkpIB2yPVlNpgU8jN/Wally-%E2%80%94-AI-Assistnat?node-id=26-602
// source=https://github.com/wallarm/design-system/blob/main/packages/design-system/src/components/ChatInput/ChatInput.tsx
// component=ChatInput
import figma from 'figma';

const instance = figma.selectedInstance;

// Variant2 adds the attached-context bar (blue badge chips) behind the box.
const hasContext = instance.getEnum('Property 1', { Default: false, Variant2: true });

const context = hasContext
  ? figma.code`
  context={
    <Badge type='secondary' color='blue'>
      <Quote />
      Attacks
      <TagClose aria-label='Remove Attacks' />
    </Badge>
  }`
  : '';

// The draft and running state are app-owned (controlled only).
const example = figma.code`<ChatInput
  value={value}
  onValueChange={setValue}
  onSubmit={send}
  onStop={stop}
  isRunning={isRunning}${context}
>
  <ChatInputTextarea />
  <ChatInputSubmit />
</ChatInput>`;

export default {
  id: 'chat-input',
  example,
  imports: [
    "import { ChatInput, ChatInputSubmit, ChatInputTextarea } from '@wallarm-org/design-system/ChatInput';",
    ...(hasContext
      ? [
          "import { Badge } from '@wallarm-org/design-system/Badge';",
          "import { TagClose } from '@wallarm-org/design-system/Tag';",
          "import { Quote } from '@wallarm-org/design-system/icons';",
        ]
      : []),
  ],
  metadata: { nestable: true },
};
