// url=https://www.figma.com/design/VKb5gW46uSGw0rqrhZsbXT/WADS-Components?node-id=94-4075
// source=https://github.com/wallarm/design-system/blob/main/packages/design-system/src/components/Kbd/KbdGroup.tsx
// component=KbdGroup
import figma from 'figma';

const instance = figma.selectedInstance;

// The variant decides how many caps are on the canvas. The inactive slots keep hidden `_symbol`
// copies ahead of the visible ones, so keep the last `count` matches.
const count = instance.getEnum('[arc] #', { '3 Slots': 3, '2': 2, '1': 1 }) ?? 3;

// Keys are private `_symbol` instances; 'Tooltip' sets them apart from their nested `Modifiers`.
const keys = instance
  .findLayers(node => node.type === 'INSTANCE' && 'Tooltip' in node.properties)
  .slice(-count)
  .map(node => {
    if (node.type !== 'INSTANCE') return figma.code``;
    // Kbd defaults to 'small'.
    const size = node.getEnum('Size', { Medium: 'medium' });
    // Type=Letter shows text 'K'; Type=Key/ESC show a nested `Modifiers` glyph instead.
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
    return figma.code`
  <Kbd${figma.helpers.react.renderProp('size', size)}>${label ?? '⌘'}</Kbd>`;
  });

const example = figma.code`<KbdGroup>${keys}
</KbdGroup>`;

export default {
  id: 'kbd-group',
  example,
  imports: ["import { Kbd, KbdGroup } from '@wallarm-org/design-system/Kbd';"],
  metadata: { nestable: true },
};
