// url=https://www.figma.com/design/VKb5gW46uSGw0rqrhZsbXT/WADS-Components?node-id=7686-2033
// source=https://github.com/wallarm/design-system/blob/main/packages/design-system/src/components/Accordion/Accordion.tsx
// component=Accordion
import figma from 'figma';

const instance = figma.selectedInstance;

const variant = instance.getEnum('Type', { Primary: undefined, Secondaty: 'secondary' });
const expanded = instance.getEnum('Expanded', { On: true, Off: false });
// The title lives in the "Header" slot as a plain text layer, not a TEXT property.
const label = instance.findText('Label');
const title = label.type === 'TEXT' ? label.textContent : 'Title';

export default {
  id: 'accordion',
  example: figma.code`<Accordion${figma.helpers.react.renderProp('variant', variant)}${expanded ? figma.code` defaultValue={['1']}` : ''}>
  <AccordionItem value='1'>
    <AccordionTrigger>${title}</AccordionTrigger>
    <AccordionContent>...</AccordionContent>
  </AccordionItem>
</Accordion>`,
  imports: [
    "import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@wallarm-org/design-system/Accordion';",
  ],
  metadata: { nestable: true },
};
