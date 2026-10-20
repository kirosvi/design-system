// url=https://www.figma.com/design/VKb5gW46uSGw0rqrhZsbXT/WADS-Components?node-id=7473-102264
// source=https://github.com/wallarm/design-system/blob/main/packages/design-system/src/components/SimpleCharts/LineChart/LineChartZoomBrush.tsx
// component=LineChartZoomBrush
import figma from 'figma';

// No Figma properties. Place inside <LineChartBody> of a <LineChart onZoomChange={...}>.
export default {
  id: 'line-chart-zoom-brush',
  example: figma.code`<LineChartZoomBrush />`,
  imports: ["import { LineChartZoomBrush } from '@wallarm-org/design-system/SimpleCharts';"],
  metadata: { nestable: true },
};
