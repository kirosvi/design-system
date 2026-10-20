// url=https://www.figma.com/design/VKb5gW46uSGw0rqrhZsbXT/WADS-Components?node-id=5022-35066
// source=https://github.com/wallarm/design-system/blob/main/packages/design-system/src/components/Tour/Tour.tsx
// component=Tour
import figma from 'figma';

const instance = figma.selectedInstance;

const title = instance.getString('Title');
const description = instance.getString('Description');
const hasMedia = instance.getBoolean('Media');

// Progress text and default Back/Next actions depend on step count and position,
// so the mapped step sits between an intro and a final step.
const example = figma.code`const targetRef = useRef<HTMLButtonElement>(null);

const tour = useTour({
  steps: [
    { id: 'intro', type: 'dialog', title: 'Welcome', description: 'Take a quick tour.' },
    {
      id: 'step',
      type: 'tooltip',
      target: () => targetRef.current,
      title: ${JSON.stringify(title)},
      description: ${JSON.stringify(description)},${hasMedia ? figma.code`\n      meta: { mediaSrc: './media.png', mediaAlt: '' },` : ''}
    },
    { id: 'done', type: 'dialog', title: 'All set', description: 'You are ready to go.' },
  ],
});

<Tour tour={tour} />`;

export default {
  id: 'tour',
  example,
  imports: [
    "import { useRef } from 'react';",
    "import { Tour, useTour } from '@wallarm-org/design-system/Tour';",
  ],
  metadata: { nestable: false },
};
