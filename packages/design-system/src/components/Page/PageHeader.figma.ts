// url=https://www.figma.com/design/VKb5gW46uSGw0rqrhZsbXT/WADS-Components?node-id=7674-6796
// source=https://github.com/wallarm/design-system/blob/main/packages/design-system/src/components/Page/PageHeader.tsx
// component=PageHeader
import figma from 'figma';

const instance = figma.selectedInstance;

// The visible "Title" text layer inside the "Heading" slot is not bound to the
// "Page title" property, so read the layer first and fall back to the property.
const titleLayer = instance.findText('Title', { path: ['Heading'] });
const title =
  titleLayer && 'textContent' in titleLayer
    ? titleLayer.textContent
    : instance.getString('Page title');
// "Heading" slot ≈ PageHeaderGroup: extra connected content (e.g. a description
// or badge) next to the title switches the snippet to PageHeaderGroup.
const headingExtras = (instance.getSlot('Heading')?.connectedInstances ?? []).map(
  i => i.executeTemplate().example,
);
// "Actions" is a SLOT holding connected Buttons; render its content as-is.
const actions = instance.getSlot('Actions');

const heading = headingExtras.length
  ? figma.code`<PageHeaderGroup>
    <PageTitle>${title}</PageTitle>
    ${headingExtras}
  </PageHeaderGroup>`
  : figma.code`<PageTitle>${title}</PageTitle>`;

export default {
  id: 'page-header',
  example: figma.code`<PageHeader>
  ${heading}${
    actions?.length
      ? figma.code`
  <PageActions>
    ${actions}
  </PageActions>`
      : ''
  }
</PageHeader>`,
  imports: [
    `import { PageActions, PageHeader, PageHeaderGroup, PageTitle } from '@wallarm-org/design-system/Page';`,
  ],
  metadata: { nestable: true },
};
