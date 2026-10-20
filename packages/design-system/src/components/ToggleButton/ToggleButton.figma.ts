// url=https://www.figma.com/design/VKb5gW46uSGw0rqrhZsbXT/WADS-Components?node-id=295-6384
// source=https://github.com/wallarm/design-system/blob/main/packages/design-system/src/components/ToggleButton/ToggleButton.tsx
// component=ToggleButton
import figma from 'figma';

const instance = figma.selectedInstance;

// Code defaults: variant='outline', color='brand', size='large' — omitted.
const variant = instance.getEnum('Type', { Ghost: 'ghost' });
const color = instance.getEnum('Color', { Neutral: 'neutral' });
const size = instance.getEnum('Size', { Medium: 'medium', Small: 'small' });
// Selected=On -> uncontrolled `defaultValue`; bare `active` would freeze the toggle without onToggle.
const active = instance.getEnum('Selected', { On: true });
const disabled = instance.getEnum('State', { Disabled: true });
const iconOnly = instance.getEnum('Icon only', { On: true });

const name = instance.getString('Name');
const leftIcon =
  iconOnly || instance.getBoolean('Left element')
    ? instance.getInstanceSwap('l-ic')?.executeTemplate().example
    : undefined;
const rightIcon =
  !iconOnly && instance.getBoolean('Right element')
    ? instance.getInstanceSwap('r-ic')?.executeTemplate().example
    : undefined;
const badge =
  !iconOnly && instance.getBoolean('Badge')
    ? instance.findInstance('numeric-badge').executeTemplate().example
    : undefined;

const example = figma.code`<ToggleButton${figma.helpers.react.renderProp('variant', variant)}${figma.helpers.react.renderProp('color', color)}${figma.helpers.react.renderProp('size', size)}${figma.helpers.react.renderProp('defaultValue', active)}${figma.helpers.react.renderProp('disabled', disabled)}${iconOnly ? figma.helpers.react.renderProp('aria-label', name) : ''}>${
  leftIcon
    ? figma.code`
  ${leftIcon}`
    : ''
}${
  iconOnly
    ? ''
    : figma.code`
  ${name}`
}${
  rightIcon
    ? figma.code`
  ${rightIcon}`
    : ''
}${
  badge
    ? figma.code`
  ${badge}`
    : ''
}
</ToggleButton>`;

export default {
  id: 'toggle-button',
  example,
  imports: ["import { ToggleButton } from '@wallarm-org/design-system/ToggleButton';"],
  metadata: { nestable: true },
};
