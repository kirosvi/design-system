// url=https://www.figma.com/design/bsqgrzkpIB2yPVlNpgU8jN/Wally-%E2%80%94-AI-Assistnat?node-id=26-737
// source=https://github.com/wallarm/design-system/blob/main/packages/design-system/src/components/UserMessage/UserMessage.tsx
// component=UserMessage
import figma from 'figma';

const instance = figma.selectedInstance;

// Type=Show more is not a prop: the bubble clamps to 11 lines and renders its
// Show more / Show less toggle on its own when the text overflows.
const isLong = instance.getEnum('Type', { Default: false, 'Show more': true });

// The actions row renders through the bubble-actions template (MessageActions).
const actions = instance.findConnectedInstance('bubble-actions');
const actionsExample = actions?.type === 'INSTANCE' ? actions.executeTemplate().example : '';

const example = figma.code`<UserMessage>
  <UserMessageBubble>{${isLong ? 'longText' : 'text'}}</UserMessageBubble>${
    actionsExample
      ? figma.code`
  ${actionsExample}`
      : ''
  }
</UserMessage>`;

export default {
  id: 'user-message',
  example,
  imports: [
    "import { UserMessage, UserMessageBubble } from '@wallarm-org/design-system/UserMessage';",
  ],
  metadata: { nestable: true },
};
