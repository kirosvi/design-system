// url=https://www.figma.com/design/VKb5gW46uSGw0rqrhZsbXT/WADS-Components?node-id=7473-101826
// source=https://github.com/wallarm/design-system/blob/main/packages/design-system/src/components/SimpleCharts/LineChart/LineChartLegend.tsx
// component=LineChartLegend

// No own properties; the "Slot" holds private _legend-item rows. Rows are mapped from the
// <LineChart series> so keys and colours match. _legend-item "State"=Diasable (off row) comes
// from <LineChart filteredKeys>; "With value" has no code prop (add your own span if needed).
import figma from 'figma';

export default {
  id: 'line-chart-legend',
  example: figma.code`<LineChartLegend>
  {series.map(s => (
    <LineChartLegendItem key={s.key} seriesKey={s.key}>
      <LineChartHoverPopoverDot color={s.color} />
      <span className='text-xs font-mono text-text-primary'>{s.label}</span>
    </LineChartLegendItem>
  ))}
</LineChartLegend>`,
  imports: [
    "import { LineChartHoverPopoverDot, LineChartLegend, LineChartLegendItem } from '@wallarm-org/design-system/SimpleCharts';",
  ],
  metadata: { nestable: true },
};
