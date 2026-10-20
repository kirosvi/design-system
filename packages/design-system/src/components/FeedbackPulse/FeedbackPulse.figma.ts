// url=https://www.figma.com/design/VKb5gW46uSGw0rqrhZsbXT/WADS-Components?node-id=8035-131
// source=https://github.com/wallarm/design-system/blob/main/packages/design-system/src/components/FeedbackPulse/FeedbackPulse.tsx
// component=FeedbackPulse
import figma from 'figma';

const instance = figma.selectedInstance;

const DEFAULT_QUESTION = 'How easy was it to use this feature?';
const DEFAULT_LOW = 'Very difficult';
const DEFAULT_HIGH = 'Very easy';
const DEFAULT_CONFIRMATION = 'Thanks a lot! — Wallarm Team';

// Unbound text layers: label-low/label-high exist in Rating/Feedback, confirmation only in Submitted.
const text = (layer: string, fallback: string) => {
  const handle = instance.findText(layer);
  return handle && 'textContent' in handle ? handle.textContent : fallback;
};
const quote = (value: string) => `'${value.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;

// State (Rating/Feedback/Submitted) is internal phase state; scale-row is a fixed 1–5 scale in code.
const question = instance.getString('Question');
const showComment = instance.getBoolean('Textarea');
const low = text('label-low', DEFAULT_LOW);
const high = text('label-high', DEFAULT_HIGH);
const confirmation = text('confirmation', DEFAULT_CONFIRMATION);

const example = figma.code`<FeedbackPulse
  open={open}
  onOpenChange={setOpen}
  onSubmit={handleSubmit}${
    question !== DEFAULT_QUESTION
      ? figma.code`
  question=${quote(question)}`
      : ''
  }${
    low !== DEFAULT_LOW || high !== DEFAULT_HIGH
      ? figma.code`
  scaleLabels={[${quote(low)}, ${quote(high)}]}`
      : ''
  }${
    showComment
      ? ''
      : figma.code`
  showComment={false}`
  }${
    confirmation !== DEFAULT_CONFIRMATION
      ? figma.code`
  confirmationText=${quote(confirmation)}`
      : ''
  }
/>`;

export default {
  id: 'feedback-pulse',
  example,
  imports: ["import { FeedbackPulse } from '@wallarm-org/design-system/FeedbackPulse';"],
  metadata: { nestable: false },
};
