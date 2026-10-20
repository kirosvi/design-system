// url=https://www.figma.com/design/VKb5gW46uSGw0rqrhZsbXT/WADS-Components?node-id=2233-8455
// source=https://github.com/wallarm/design-system/blob/main/packages/design-system/src/components/Calendar/Calendar.tsx
// component=Calendar
import figma from 'figma';

const instance = figma.selectedInstance;

const type = instance.getEnum('Type', { Single: 'single', Double: 'range' });
const hasPresets = instance.getEnum('Presets', { On: true, Off: false });
const hasInput = instance.getEnum('Input', { On: true, Off: false });
const hasFooter = instance.getEnum('Footer', { On: true, Off: false });

// Nested private layers carry the remaining code-relevant settings.
const presetsLayer = hasPresets ? instance.findInstance('_date-presets') : undefined;
const showShortcuts =
  presetsLayer && presetsLayer.type !== 'ERROR'
    ? presetsLayer.getEnum('KBI', { On: undefined, Off: false })
    : undefined;
const inputLayer = hasInput ? instance.findInstance('_input-header') : undefined;
const showTime =
  inputLayer && inputLayer.type !== 'ERROR'
    ? // Code has no time-only mode: Time falls back to the datetime header.
      inputLayer.getEnum('Format', { Date: undefined, Datetime: true, Time: true })
    : undefined;
const footerLayer = hasFooter ? instance.findInstance('_footer') : undefined;
const footerValid = footerLayer && footerLayer.type !== 'ERROR';
const footerHints = footerValid ? footerLayer.getBoolean('KBI') : true;
const footerReset = footerValid ? footerLayer.getBoolean('Reset') : true;

const isRange = type === 'range';
const footer = hasFooter
  ? `\n      <CalendarFooter>${footerHints ? '\n        <CalendarKeyboardHints />' : ''}\n        <CalendarFooterControls>${footerReset ? '\n          <CalendarResetButton />' : ''}\n          <CalendarApplyButton />\n        </CalendarFooterControls>\n      </CalendarFooter>`
  : '';

const example = figma.code`<Calendar${isRange ? " type='range'" : ''}${figma.helpers.react.renderProp('showTime', showTime)}>
  <CalendarTrigger>
    <Button variant='outline' color='neutral'>
      ${isRange ? 'Select date range' : 'Select date'}
    </Button>
  </CalendarTrigger>
  <CalendarContent>${hasPresets ? `\n    <CalendarPresets${showShortcuts === false ? ' showShortcuts={false}' : ''} />` : ''}
    <CalendarBody>${hasInput ? '\n      <CalendarInputHeader />' : ''}
      <CalendarGrids />${footer}
    </CalendarBody>
  </CalendarContent>
</Calendar>`;

export default {
  id: 'calendar',
  example,
  imports: [
    "import { Calendar, CalendarApplyButton, CalendarBody, CalendarContent, CalendarFooter, CalendarFooterControls, CalendarGrids, CalendarInputHeader, CalendarKeyboardHints, CalendarPresets, CalendarResetButton, CalendarTrigger } from '@wallarm-org/design-system/Calendar';",
    "import { Button } from '@wallarm-org/design-system/Button';",
  ],
  metadata: { nestable: false },
};
