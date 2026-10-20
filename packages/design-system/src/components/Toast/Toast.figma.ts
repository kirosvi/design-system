// url=https://www.figma.com/design/VKb5gW46uSGw0rqrhZsbXT/WADS-Components?node-id=1576-14255
// source=https://github.com/wallarm/design-system/blob/main/packages/design-system/src/components/Toast/Toast.tsx
// component=Toast
import figma from 'figma';

const instance = figma.selectedInstance;

const type = instance.getEnum('Type', {
  Default: 'default',
  Success: 'success',
  Destructive: 'error',
  Loading: 'loading',
  Warning: 'warning',
  Info: 'info',
});
const quote = (value: string) => `'${value.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
const title = instance.getString('Title');
const isExtended = instance.getEnum('Layout', { Simple: false, Extended: true });
// A non-empty description forces the extended layout; only an empty one needs `variant`.
const description = isExtended ? instance.getString('Description') : '';
const isClosable = instance.getBoolean('Closable');
const isAutoDismissible = instance.getBoolean('Auto-dismissible');
const actions = instance.getBoolean('Actions')
  ? instance
      .findConnectedInstances(node => node.name === 'Button-1' || node.name === 'Button-2')
      .map(button => button.executeTemplate().example)
  : [];

const example = figma.code`toaster.create({
  title: ${quote(title)},
  ${description ? `description: ${quote(description)},` : isExtended ? "variant: 'extended'," : ''}
  type: '${type}',
  ${
    actions.length
      ? figma.code`actions: (
    <ToastActions>
      ${actions}
    </ToastActions>
  ),`
      : ''
  }
  ${isClosable ? '' : 'closable: false,'}
  ${isAutoDismissible ? '' : 'duration: Infinity,'}
});`;

export default {
  id: 'toast',
  example,
  imports: ["import { ToastActions, toaster } from '@wallarm-org/design-system/Toast';"],
  metadata: { nestable: false },
};
