// url=https://www.figma.com/design/VKb5gW46uSGw0rqrhZsbXT/WADS-Components?node-id=11753-35022
// source=https://github.com/wallarm/design-system/blob/main/packages/design-system/src/components/Timeline/Timeline.tsx
// component=Timeline
import figma from 'figma';

const instance = figma.selectedInstance;

// The Figma "Slot" holds only the rail: one numeric-badge per step (separators between them).
// Each badge becomes a TimelineItem; title/description content is not modelled in Figma.
const items = instance
  .findConnectedInstances(node => node.codeConnectId() === 'numeric-badge')
  .filter(badge => badge.type === 'INSTANCE')
  .map(badge => {
    const color = badge.getEnum('Color', {
      'Neutral-alt': 'neutral-alt',
      Brand: 'brand',
      Danger: 'danger',
      Info: 'info',
      Success: 'success',
    });
    return figma.code`
  <TimelineItem>
    <TimelineConnector>
      <TimelineIndicator${figma.helpers.react.renderProp('color', color)}>${badge.getString('#')}</TimelineIndicator>
      <TimelineSeparator />
    </TimelineConnector>
  </TimelineItem>`;
  });

export default {
  id: 'timeline',
  example: figma.code`<Timeline>${items}
</Timeline>`,
  imports: [
    "import { Timeline, TimelineConnector, TimelineIndicator, TimelineItem, TimelineSeparator } from '@wallarm-org/design-system/Timeline';",
  ],
  metadata: { nestable: true },
};
