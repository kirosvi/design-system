// url=https://www.figma.com/design/VKb5gW46uSGw0rqrhZsbXT/WADS-Components?node-id=7566-36943
// source=https://github.com/wallarm/design-system/blob/main/packages/design-system/src/components/EmptyState/EmptyState.tsx
// component=EmptyState
import figma from 'figma';

const instance = figma.selectedInstance;

const type = instance.getEnum('Type', {
  'Collection empty': undefined,
  'No results': 'no-results',
});

// Title/Subtitle are plain text layers, not TEXT properties.
const textOf = (layer: string) => {
  const node = instance.findText(layer);
  return node.type === 'TEXT' ? node.textContent : '';
};

// Collection empty always shows the medallion; No results only when "Icon" is on.
const icon =
  !type || instance.getBoolean('Icon')
    ? instance.getInstanceSwap('Icon2')?.executeTemplate().example
    : undefined;
const description = instance.getBoolean('Subtitle') ? textOf('Subtitle') : undefined;
// Scoped to the "Buttons" frame so renamed button layers are still picked up.
const buttons = instance.getBoolean('Buttons')
  ? instance
      .findConnectedInstances(() => true, { path: ['Buttons'] })
      .map(button => button.executeTemplate().example)
  : [];

// Nested published Link (949:2830): read its own props, render as EmptyStateLink (size defaults to md).
const linkInst = instance.getBoolean('Link') ? instance.findInstance('link') : undefined;
const link = linkInst?.type === 'INSTANCE' ? linkInst : undefined;
const linkLabel = link?.getString('Label');
const linkType = link?.getEnum('Type', { Alt: 'alt', Muted: 'muted', Table: 'table' });
const linkSize = link?.getEnum('Size', { xs: 'xs', sm: 'sm', lg: 'lg', xl: 'xl' });
const linkWeight = link?.getEnum('Medium', { On: 'medium' });
const newTab = link?.getBoolean('New tab') ?? false;
const linkIcon = link?.getBoolean('Right icon')
  ? link.getInstanceSwap('r-ic')?.executeTemplate().example
  : undefined;

const example = figma.code`<EmptyState${figma.helpers.react.renderProp('type', type)}>${
  icon
    ? figma.code`
  <EmptyStateIllustration>${icon}</EmptyStateIllustration>`
    : ''
}
  <EmptyStateMessage>
    <EmptyStateTitle>${textOf('Title')}</EmptyStateTitle>${
      description
        ? figma.code`
    <EmptyStateDescription>${description}</EmptyStateDescription>`
        : ''
    }
  </EmptyStateMessage>${
    buttons.length
      ? figma.code`
  <EmptyStateActions>${buttons}</EmptyStateActions>`
      : ''
  }${
    link
      ? figma.code`
  <EmptyStateLink href='#'${figma.helpers.react.renderProp('type', linkType)}${figma.helpers.react.renderProp('size', linkSize)}${figma.helpers.react.renderProp('weight', linkWeight)}${newTab ? figma.code` target='_blank' rel='noopener noreferrer'` : ''}>
    ${linkLabel}${linkIcon ?? ''}${newTab ? figma.code`<SquareArrowOutUpRight />` : ''}
  </EmptyStateLink>`
      : ''
  }
</EmptyState>`;

export default {
  id: 'empty-state',
  example,
  imports: [
    "import { EmptyState, EmptyStateActions, EmptyStateDescription, EmptyStateIllustration, EmptyStateLink, EmptyStateMessage, EmptyStateTitle } from '@wallarm-org/design-system/EmptyState';",
    ...(newTab
      ? ["import { SquareArrowOutUpRight } from '@wallarm-org/design-system/icons';"]
      : []),
  ],
  metadata: { nestable: true },
};
