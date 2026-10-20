// url=https://www.figma.com/design/VKb5gW46uSGw0rqrhZsbXT/WADS-Components?node-id=36-2305
// source=https://github.com/wallarm/design-system/blob/main/packages/design-system/src/components/Button/Button.tsx
// component=Button
import figma from 'figma';

const instance = figma.selectedInstance;

const variant = instance.getEnum('Type', {
  Outline: 'outline',
  Ghost: 'ghost',
  Secondary: 'secondary',
});
const color = instance.getEnum('Color', {
  Neutral: 'neutral',
  Destructive: 'destructive',
  'Neutral-alt': 'neutral-alt',
});
const size = instance.getEnum('Size', { Medium: 'medium', Small: 'small' });
const loading = instance.getEnum('State', { Loading: true });
const disabled = instance.getEnum('State', { Disabled: true });
const iconOnly = instance.getEnum('Icon only', { On: true });

const name = instance.getString('Name');
// Loading variants don't bind l-ic/r-ic to their icon layers, so the icon comes
// from the property value. Code still needs the children while loading: the
// spinner covers them but keeps the label's footprint.
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

// The Name text layer exists only in Icon only=Off variants, so it can't be edited
// on an icon-only button: emit a placeholder aria-label instead of the hidden value.
const example = figma.code`<Button${figma.helpers.react.renderProp('variant', variant)}${figma.helpers.react.renderProp('color', color)}${figma.helpers.react.renderProp('size', size)}${figma.helpers.react.renderProp('loading', loading)}${figma.helpers.react.renderProp('disabled', disabled)}${iconOnly ? figma.code` aria-label='Action'` : ''}>
  ${leftIcon ? figma.code`${leftIcon}${iconOnly ? '' : '\n  '}` : ''}${iconOnly ? '' : name}${rightIcon ? figma.code`\n  ${rightIcon}` : ''}${badge ? figma.code`\n  ${badge}` : ''}
</Button>`;

export default {
  id: 'button',
  example,
  imports: ["import { Button } from '@wallarm-org/design-system/Button';"],
  metadata: { nestable: true },
};
