// url=https://www.figma.com/design/VKb5gW46uSGw0rqrhZsbXT/WADS-Components?node-id=7473-102267
// source=https://github.com/wallarm/design-system/blob/main/packages/design-system/src/components/SimpleCharts/LineChart/LineChartHoverPopover.tsx
// component=LineChartHoverPopover
import figma from 'figma';

const instance = figma.selectedInstance;

// "Property 1"=Value -> custom tooltip body; "Zoom-in" -> the zoom popover, which only
// LineChartZoomBrush renders (its confirm handler is internal). Rows/values come from chart
// data at runtime, so the Figma row texts are not mapped. Both go inside <LineChartBody>.
const zoom = instance.getEnum('Property 1', { Value: false, 'Zoom-in': true });

const button = instance.findText('Button', { traverseInstances: true });
const confirmLabel =
  button.type === 'TEXT' && button.textContent !== 'Zoom in' ? button.textContent : undefined;

export default {
  id: 'line-chart-hover-popover',
  example: zoom
    ? figma.code`<LineChartZoomBrush${figma.helpers.react.renderProp('confirmLabel', confirmLabel)} />`
    : figma.code`<LineChartTooltip>
  {({ rows, xValue }) => (
    <LineChartHoverPopover>
      <LineChartHoverPopoverTimestamp>{formatTimestamp(xValue)}</LineChartHoverPopoverTimestamp>
      {rows.map(({ series, value }) => (
        <LineChartHoverPopoverRow key={series.key} series={series} value={value} />
      ))}
    </LineChartHoverPopover>
  )}
</LineChartTooltip>`,
  imports: [
    zoom
      ? "import { LineChartZoomBrush } from '@wallarm-org/design-system/SimpleCharts';"
      : "import { LineChartHoverPopover, LineChartHoverPopoverRow, LineChartHoverPopoverTimestamp, LineChartTooltip } from '@wallarm-org/design-system/SimpleCharts';",
  ],
  metadata: { nestable: true },
};
