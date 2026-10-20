// url=https://www.figma.com/design/VKb5gW46uSGw0rqrhZsbXT/WADS-Components?node-id=2619-13738
// source=https://github.com/wallarm/design-system/blob/main/packages/design-system/src/components/Popover/PopoverContent.tsx
// component=PopoverContent
import figma from 'figma';

const instance = figma.selectedInstance;

// Figma draws only the open panel; the trigger is not part of the component.
const slot = instance.getSlot('Slot');

const example = figma.code`<Popover>
  <PopoverTrigger asChild>
    <Button variant='outline' color='neutral'>Open</Button>
  </PopoverTrigger>
  <PopoverContent>
    ${slot?.length ? slot : '...'}
  </PopoverContent>
</Popover>`;

export default {
  id: 'popover',
  example,
  imports: [
    "import { Popover, PopoverContent, PopoverTrigger } from '@wallarm-org/design-system/Popover';",
    "import { Button } from '@wallarm-org/design-system/Button';",
  ],
  metadata: { nestable: true },
};
