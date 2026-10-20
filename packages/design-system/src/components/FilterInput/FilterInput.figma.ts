// url=https://www.figma.com/design/VKb5gW46uSGw0rqrhZsbXT/WADS-Components?node-id=5992-58496
// source=https://github.com/wallarm/design-system/blob/main/packages/design-system/src/components/FilterInput/FilterInput.tsx
// component=FilterInput
import figma from 'figma';

const instance = figma.selectedInstance;

const placeholder = instance.getString('Placeholder');
const error = instance.getEnum('Error', { On: true });
const showKeyboardHint = instance.getBoolean('Keyboard input');

const example = figma.code`<FilterInput
  fields={fields}
  value={expression}
  onChange={setExpression}${figma.helpers.react.renderProp('placeholder', placeholder)}${figma.helpers.react.renderProp('error', error)}${figma.helpers.react.renderProp('showKeyboardHint', showKeyboardHint)}
/>`;

export default {
  id: 'filter-input',
  example,
  imports: ["import { FilterInput } from '@wallarm-org/design-system/FilterInput';"],
  metadata: { nestable: true },
};
