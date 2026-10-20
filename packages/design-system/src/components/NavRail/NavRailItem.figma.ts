// url=https://www.figma.com/design/VKb5gW46uSGw0rqrhZsbXT/WADS-Components?node-id=9258-48955
// source=https://github.com/wallarm/design-system/blob/main/packages/design-system/src/components/NavRail/NavRailItem.tsx
// component=NavRailItem
import figma from 'figma';

const instance = figma.selectedInstance;

const label = instance.getString('Item name');
const active = instance.getEnum('Active', { Off: false, On: true });
const avatar = instance.getEnum('User item', { Off: false, On: true });
const loading = instance.getEnum('State', { Loading: true });

// `icon` takes the component itself, not an element. Icon batch ids equal their export names
// (PascalCase); component templates use kebab-case ids, so the regex keeps them out.
const iconHandle = instance.getInstanceSwap('Icon');
const iconId = iconHandle?.type === 'INSTANCE' ? iconHandle.codeConnectId() : null;
const iconName = iconId && /^[A-Z][A-Za-z0-9]*$/.test(iconId) ? iconId : 'CircleDashed';
const iconTodo = iconName === iconId ? '' : ' /* TODO: map icon */';

export default {
  id: 'nav-rail-item',
  example: loading
    ? figma.code`<NavRailSkeleton count={1} />`
    : figma.code`<NavRailItem icon={${iconName}${iconTodo}}${figma.helpers.react.renderProp('label', label)}${figma.helpers.react.renderProp('active', active)}${figma.helpers.react.renderProp('avatar', avatar)} href='#' />`,
  imports: loading
    ? ["import { NavRailSkeleton } from '@wallarm-org/design-system/NavRail';"]
    : [
        "import { NavRailItem } from '@wallarm-org/design-system/NavRail';",
        `import { ${iconName} } from '@wallarm-org/design-system/icons';`,
      ],
  metadata: { nestable: true },
};
