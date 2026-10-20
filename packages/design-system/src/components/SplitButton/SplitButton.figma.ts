// url=https://www.figma.com/design/VKb5gW46uSGw0rqrhZsbXT/WADS-Components?node-id=8485-26647
// source=https://github.com/wallarm/design-system/blob/main/packages/design-system/src/components/SplitButton/SplitButton.tsx
// component=SplitButton
import figma from 'figma';

const instance = figma.selectedInstance;

// Both halves are connected Buttons. The primary half renders through its own Button
// template, so the trigger reads Type/Color/Size from that same layer to stay in sync.
const primaryLayer = instance.findInstance('primary-button');
const primary = primaryLayer.executeTemplate().example;
const primaryButton = primaryLayer.type === 'INSTANCE' ? primaryLayer : undefined;
const variant = primaryButton?.getEnum('Type', {
  Outline: 'outline',
  Ghost: 'ghost',
  Secondary: 'secondary',
});
const color = primaryButton?.getEnum('Color', {
  Neutral: 'neutral',
  Destructive: 'destructive',
  'Neutral-alt': 'neutral-alt',
});
const size = primaryButton?.getEnum('Size', { Medium: 'medium', Small: 'small' });

// The trigger keeps its own state and icon; aria-label is explicit since it's icon-only.
const moreLayer = instance.findInstance('more-button');
const more = moreLayer.type === 'INSTANCE' ? moreLayer : undefined;
const disabled = more?.getEnum('State', { Disabled: true });
const loading = more?.getEnum('State', { Loading: true });
const moreIcon =
  more?.getInstanceSwap('l-ic')?.executeTemplate().example ?? figma.code`<ChevronDown />`;

const example = figma.code`<SplitButton>
  ${primary}
  <Button${figma.helpers.react.renderProp('variant', variant)}${figma.helpers.react.renderProp('color', color)}${figma.helpers.react.renderProp('size', size)}${figma.helpers.react.renderProp('loading', loading)}${figma.helpers.react.renderProp('disabled', disabled)} aria-label='More actions'>
    ${moreIcon}
  </Button>
</SplitButton>`;

export default {
  id: 'split-button',
  example,
  imports: [
    "import { SplitButton } from '@wallarm-org/design-system/SplitButton';",
    "import { Button } from '@wallarm-org/design-system/Button';",
    "import { ChevronDown } from '@wallarm-org/design-system/icons';",
  ],
  metadata: { nestable: true },
};
