// url=https://www.figma.com/design/VKb5gW46uSGw0rqrhZsbXT/WADS-Components?node-id=1584-1798
// source=https://github.com/wallarm/design-system/blob/main/packages/design-system/src/components/Alert/Alert.tsx
// component=Alert
import figma from 'figma';

const instance = figma.selectedInstance;

const color = instance.getEnum('Type', {
  Primary: undefined,
  Destructive: 'destructive',
  Info: 'info',
  Warning: 'warning',
  Success: 'success',
});
const title = instance.getString('Title');
const hasIcon = instance.getBoolean('Left icon');
const hasDescription = instance.getBoolean('Description');
const isClosable = instance.getBoolean('Closable');

// By default 'l-ic' holds circle-dashed (Primary) or the private per-type _alert-ic,
// both of which AlertIcon picks on its own. Only a swapped-in connected icon is an override.
const iconSwap = instance.getInstanceSwap('l-ic');
const customIcon =
  iconSwap?.type === 'INSTANCE' &&
  iconSwap.hasCodeConnect() &&
  iconSwap.codeConnectId() !== 'CircleDashed'
    ? iconSwap.executeTemplate().example
    : undefined;

// 'TA slot' wraps its buttons in an 'Actions' frame, so a shallow slot render can come out
// empty; fall back to the connected instances found anywhere under the slot.
const actions = (enabled: string, slotName: string) => {
  if (!instance.getBoolean(enabled)) return undefined;
  const slot = instance.getSlot(slotName);
  if (slot?.connectedInstances.length) return slot;
  const nested = instance
    .findConnectedInstances(() => true, { path: [slotName] })
    .map(i => i.executeTemplate().example);
  return nested.length ? nested : undefined;
};
const topActions = actions('Top actions', 'TA slot');
const bottomActions = actions('Bottom actions', 'BA slot');

const example = figma.code`<Alert${figma.helpers.react.renderProp('color', color)}>${
  hasIcon
    ? customIcon
      ? figma.code`
  <AlertIcon icon={${customIcon}} />`
      : figma.code`
  <AlertIcon />`
    : ''
}
  <AlertContent>
    <AlertTitle>${title}</AlertTitle>${
      hasDescription
        ? figma.code`
    <AlertDescription>${instance.getString('Text')}</AlertDescription>`
        : ''
    }${
      bottomActions
        ? figma.code`
    <AlertControls>${bottomActions}</AlertControls>`
        : ''
    }
  </AlertContent>${
    topActions
      ? figma.code`
  <AlertControls>${topActions}</AlertControls>`
      : ''
  }${
    isClosable
      ? figma.code`
  <AlertClose />`
      : ''
  }
</Alert>`;

export default {
  id: 'alert',
  example,
  imports: [
    "import { Alert, AlertClose, AlertContent, AlertControls, AlertDescription, AlertIcon, AlertTitle } from '@wallarm-org/design-system/Alert';",
  ],
  metadata: { nestable: true },
};
