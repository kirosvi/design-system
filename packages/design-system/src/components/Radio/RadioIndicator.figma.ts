// url=https://www.figma.com/design/VKb5gW46uSGw0rqrhZsbXT/WADS-Components?node-id=290-5713
// source=https://github.com/wallarm/design-system/blob/main/packages/design-system/src/components/Radio/RadioIndicator.tsx
// component=RadioIndicator
import figma from 'figma';

const instance = figma.selectedInstance;

// RadioIndicator takes no props: selection lives on RadioGroup, disabled on Radio.
const checked = instance.getEnum('Selected', { On: true }) === true;
const disabled = instance.getEnum('State', { Disable: true });

export default {
  id: 'radio-indicator',
  example: figma.code`<RadioGroup${checked ? figma.code` defaultValue='option'` : ''}>
  <Radio value='option'${figma.helpers.react.renderProp('disabled', disabled)} aria-label='Label'>
    <RadioIndicator />
  </Radio>
</RadioGroup>`,
  imports: [
    "import { Radio, RadioGroup, RadioIndicator } from '@wallarm-org/design-system/Radio';",
  ],
  metadata: { nestable: true },
};
