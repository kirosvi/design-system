// url=https://www.figma.com/design/bsqgrzkpIB2yPVlNpgU8jN/Wally-%E2%80%94-AI-Assistnat?node-id=44-1739
// source=https://github.com/wallarm/design-system/blob/main/packages/design-system/src/components/Chat/ChatGreeting.tsx
// component=ChatGreeting
import figma from 'figma';

const instance = figma.selectedInstance;

const greeting = instance.findText('Greeting text', { path: ['Greeting container'] });
const title = greeting.type === 'TEXT' ? greeting.textContent : 'How can I help you today?';
const heading = instance.findText('Suggestions heading', { path: ['Suggestions container'] });
const label = heading.type === 'TEXT' ? heading.textContent : 'Suggestions';

// Each chat-pill renders through its own template (ChatSuggestion).
const pills = instance
  .findConnectedInstances(node => node.codeConnectId() === 'chat-pill')
  .map(pill => pill.executeTemplate().example);

const example = figma.code`<ChatGreeting title='${title}'>
  <ChatSuggestions placement='greeting' label='${label}'>
    ${pills}
  </ChatSuggestions>
</ChatGreeting>`;

export default {
  id: 'greeting-new-chat',
  example,
  imports: ["import { ChatGreeting, ChatSuggestions } from '@wallarm-org/design-system/Chat';"],
  metadata: { nestable: true },
};
