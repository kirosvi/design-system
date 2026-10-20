// url=https://www.figma.com/design/VKb5gW46uSGw0rqrhZsbXT/WADS-Components?node-id=12463-208896
// source=https://github.com/wallarm/design-system/blob/main/packages/design-system/src/components/Stepper/StepperItem.tsx
// component=StepperItem
import figma from 'figma';

const instance = figma.selectedInstance;

// Active is not a status: the current step is set on the root (`step` / `defaultStep`).
const status = instance.getEnum('Type', {
  Upcoming: undefined,
  Completed: 'completed',
  Danger: 'danger',
});
const active = instance.getEnum('Type', { Active: true }) ?? false;
const title = instance.getString('Step');
const description = instance.getBoolean('Description')
  ? instance.getString('Description text')
  : undefined;

// The badge number is not a prop: StepperIndicator derives it from `index`. Standalone, the
// index is a placeholder; the Stepper template re-renders items with their real positions.
const item = (index: number) =>
  figma.code`<StepperItem index={${index}}${figma.helpers.react.renderProp('status', status)}>
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
</StepperItem>`;

export default {
  id: 'stepper-item',
  // Non-active types sit at index 1: index 0 is the default current step, which renders active.
  example: item(status ? 1 : 0),
  imports: [
    "import { StepperDescription, StepperIndicator, StepperItem, StepperSeparator, StepperTitle, StepperTrigger } from '@wallarm-org/design-system/Stepper';",
  ],
  metadata: { nestable: true, props: { status, title, description, active } },
};
