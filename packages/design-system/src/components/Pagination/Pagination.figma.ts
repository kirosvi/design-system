// url=https://www.figma.com/design/VKb5gW46uSGw0rqrhZsbXT/WADS-Components?node-id=11061-570
// source=https://github.com/wallarm/design-system/blob/main/packages/design-system/src/components/Pagination/Pagination.tsx
// component=Pagination
import figma from 'figma';

const instance = figma.selectedInstance;

const align = instance.getEnum('Alignment', {
  Left: undefined,
  Center: 'center',
  Right: 'right',
});
const size = instance.getEnum('Size', { Medium: undefined, Small: 'small' });

// Type / Page size live on the private nested `_pagination-controls` instance.
const controls = instance.findInstance('_pagination-controls');
const type =
  controls.type === 'INSTANCE'
    ? controls.getEnum('Type', { Simple: 'simple', Full: 'full', 'Links only': 'links' })
    : 'full';
const hasPageSize = controls.type === 'INSTANCE' && controls.getBoolean('Page size');
const hasLinks = type !== 'simple';
const hasList = type !== 'links';

const example = figma.code`<Pagination count={120}${figma.helpers.react.renderProp('size', size)}${figma.helpers.react.renderProp('align', align)}>${
  hasPageSize
    ? figma.code`
  <PaginationPageSize options={[10, 25, 50]} />`
    : ''
}${
  hasLinks
    ? figma.code`
  <PaginationPrevious />`
    : ''
}${
  hasList
    ? figma.code`
  <PaginationList />`
    : ''
}${
  hasLinks
    ? figma.code`
  <PaginationNext />`
    : ''
}
</Pagination>`;

export default {
  id: 'pagination',
  example,
  imports: [
    "import { Pagination, PaginationList, PaginationNext, PaginationPageSize, PaginationPrevious } from '@wallarm-org/design-system/Pagination';",
  ],
  metadata: { nestable: true },
};
