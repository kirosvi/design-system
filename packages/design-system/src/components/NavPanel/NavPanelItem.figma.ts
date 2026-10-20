// url=https://www.figma.com/design/VKb5gW46uSGw0rqrhZsbXT/WADS-Components?node-id=9303-1857
// source=https://github.com/wallarm/design-system/blob/main/packages/design-system/src/components/NavPanel/NavPanelItem.tsx
// component=NavPanelItem
import figma from 'figma';

const instance = figma.selectedInstance;

// Strip braces so placeholder text like `{prior-level}` stays text, not a JSX expression.
const label = instance.getString('Item name').replace(/[{}]/g, '');
const active = instance.getEnum('Active', { On: true, Off: false });
const nested = instance.getEnum('Nested', { On: true, Off: false });
const level = instance.getEnum('Level', { '1st': 1, '2nd': 2, '3rd': 3 });
const hasIcon = instance.getEnum('Left-ic', { On: true, Off: false });

// `icon` takes a component, not an element: use the icon's Code Connect id (= export name).
const swap = instance.getInstanceSwap('Icon');
const swapId = swap?.type === 'INSTANCE' ? (swap.codeConnectId() ?? undefined) : undefined;
const iconName = hasIcon ? swapId : undefined;
const icon = iconName ? figma.code` icon={${iconName}}` : '';
const iconImports = iconName
  ? [`import { ${iconName} } from '@wallarm-org/design-system/icons';`]
  : [];

// One Figma set covers several code parts: back row (corner-up-left icon or "Back to …")
// → NavPanelBack, Nested → group label, Level 2nd/3rd → group item (depth comes from
// NavPanelGroupContent nesting).
const isBack = swapId === 'CornerUpLeft' || label.startsWith('Back to ');
const backTo = isBack ? label.replace(/^Back to /, '') : undefined;
const activeProp = active ? ' active' : '';

const example =
  backTo !== undefined
    ? figma.code`<NavPanelBack onClick={() => {}}>${backTo}</NavPanelBack>`
    : nested
      ? figma.code`<NavPanelGroup>
  <NavPanelGroupLabel${icon}>${label}</NavPanelGroupLabel>
  <NavPanelGroupContent>
    <NavPanelGroupItem href='#'>...</NavPanelGroupItem>
  </NavPanelGroupContent>
</NavPanelGroup>`
      : level !== undefined && level > 1
        ? figma.code`<NavPanelGroupItem href='#'${icon}${activeProp}>${label}</NavPanelGroupItem>`
        : figma.code`<NavPanelItem href='#'${icon}${activeProp}>${label}</NavPanelItem>`;

const component =
  backTo !== undefined
    ? 'NavPanelBack'
    : nested
      ? 'NavPanelGroup, NavPanelGroupContent, NavPanelGroupItem, NavPanelGroupLabel'
      : level !== undefined && level > 1
        ? 'NavPanelGroupItem'
        : 'NavPanelItem';

export default {
  id: 'nav-panel-item',
  example,
  imports: [`import { ${component} } from '@wallarm-org/design-system/NavPanel';`, ...iconImports],
  metadata: { nestable: true },
};
