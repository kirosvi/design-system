// url=https://www.figma.com/design/bsqgrzkpIB2yPVlNpgU8jN/Wally-%E2%80%94-AI-Assistnat?node-id=8-3101
// source=https://github.com/wallarm/design-system/blob/main/packages/design-system/src/components/Chat/ChatSuggestion.tsx
// component=ChatSuggestion
import figma from 'figma';

const instance = figma.selectedInstance;

// Size (Large / Medium) is not a prop: the pill takes it from its ChatSuggestions placement
// (greeting → Large, footer → Medium). State=Hover is a CSS state.
const example = figma.code`<ChatSuggestion>${instance.getString('Label')}</ChatSuggestion>`;

export default {
  id: 'chat-pill',
  example,
  imports: ["import { ChatSuggestion } from '@wallarm-org/design-system/Chat';"],
  metadata: { nestable: true },
};
