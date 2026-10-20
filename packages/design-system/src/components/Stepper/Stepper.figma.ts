// url=https://www.figma.com/design/VKb5gW46uSGw0rqrhZsbXT/WADS-Components?node-id=12463-208988
// source=https://github.com/wallarm/design-system/blob/main/packages/design-system/src/components/Stepper/Stepper.tsx
// component=Stepper
import figma from 'figma';

const instance = figma.selectedInstance;

// Only the stepper-item instances, matched by Code Connect id (layer names can be renamed): the
// slot's separator layers map to the StepperSeparator inside each item. Items are re-rendered here so each gets its real `index`.
interface ItemProps {
  status?: string;
  title: string;
  description?: string;
  active: boolean;
}
const items = (instance.getSlot('Slot')?.connectedInstances ?? [])
  .filter(node => node.codeConnectId() === 'stepper-item')
  .flatMap(node => {
    const props = node.executeTemplate().metadata?.props as ItemProps | undefined;
    return props ? [props] : [];
  });
const step = Math.max(
  items.findIndex(item => item.active),
  0,
);

const steps = items.map(
  ({ status, title, description }, index) => figma.code`
    <StepperItem index={${index}}${figma.helpers.react.renderProp('status', status)}>
      <StepperTrigger>
        <StepperIndicator />
        <StepperTitle>${title}</StepperTitle>${
          description
            ? figma.code`
        <StepperDescription>${description}</StepperDescription>`
            : ''
        }
      </StepperTrigger>
      <StepperSeparator />
    </StepperItem>`,
);

export default {
  id: 'stepper',
  example: figma.code`<Stepper count={${items.length}}${step ? figma.code` defaultStep={${step}}` : ''}>
  <StepperList aria-label='Steps'>${steps}
  </StepperList>
</Stepper>`,
  imports: [
    "import { Stepper, StepperDescription, StepperIndicator, StepperItem, StepperList, StepperSeparator, StepperTitle, StepperTrigger } from '@wallarm-org/design-system/Stepper';",
  ],
  metadata: { nestable: true },
};
