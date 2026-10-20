// url=https://www.figma.com/design/VKb5gW46uSGw0rqrhZsbXT/WADS-Components?node-id=269-10037
// source=https://github.com/wallarm/design-system/blob/main/packages/design-system/src/components/Tooltip/Tooltip.tsx
// component=Tooltip
import figma from 'figma';

const instance = figma.selectedInstance;

const type = instance.getEnum('Type', {
  Default: 'default',
  Description: 'description',
  KBI: 'kbi',
});
const name = instance.getString('Name');
// TooltipContent restyles only direct `<Kbd>` children, so emit bare keys instead of the
// nested KbdGroup template. Label extraction mirrors Kbd/KbdGroup.figma.ts.
const kbdInput = type === 'kbi' ? instance.findInstance('keyboard-input') : undefined;
const keys =
  kbdInput?.type === 'INSTANCE'
    ? kbdInput
        .findLayers(node => node.type === 'INSTANCE' && 'Tooltip' in node.properties)
        .slice(-(kbdInput.getEnum('[arc] #', { '3 Slots': 3, '2': 2, '1': 1 }) ?? 3))
        .map(node => {
          if (node.type !== 'INSTANCE') return figma.code``;
          const text = node.findText('K');
          const modifiers = node.findInstance('Modifiers');
          const label =
            text.type === 'TEXT'
              ? text.textContent
              : modifiers.type === 'INSTANCE'
                ? modifiers.getEnum('Type', {
                    command: '⌘',
                    shift: '⇧',
                    Space: 'Space',
                    alt: '⌥',
                    ctrl: 'Ctrl',
                    'arrow-up': '↑',
                    'arrow-down': '↓',
                    'arrow-left': '←',
                    'arrow-right': '→',
                    enter: '↵',
                    esc: 'Esc',
                  })
                : node.getEnum('Type', { ESC: 'Esc' });
          return figma.code` <Kbd>${label ?? '⌘'}</Kbd>`;
        })
    : [];

const content =
  type === 'description'
    ? figma.code`
    <Text size='xs' weight='medium'>
      ${name}
    </Text>
    <Text size='xs'>${instance.getString('Text')}</Text>
  `
    : figma.code`${name}${keys}`;

const example = figma.code`<Tooltip>
  <TooltipTrigger asChild>
    <Button variant='outline' color='neutral'>Trigger</Button>
  </TooltipTrigger>
  <TooltipContent>${content}</TooltipContent>
</Tooltip>`;

export default {
  id: 'tooltip',
  example,
  imports: [
    "import { Tooltip, TooltipContent, TooltipTrigger } from '@wallarm-org/design-system/Tooltip';",
    "import { Button } from '@wallarm-org/design-system/Button';",
    ...(type === 'description' ? ["import { Text } from '@wallarm-org/design-system/Text';"] : []),
    ...(type === 'kbi' ? ["import { Kbd } from '@wallarm-org/design-system/Kbd';"] : []),
  ],
  metadata: { nestable: true },
};
