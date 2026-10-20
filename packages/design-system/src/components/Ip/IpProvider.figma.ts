// url=https://www.figma.com/design/VKb5gW46uSGw0rqrhZsbXT/WADS-Components?node-id=4722-6945
// source=https://github.com/wallarm/design-system/blob/main/packages/design-system/src/components/Ip/IpProvider.tsx
// component=IpProvider
import figma from 'figma';

const instance = figma.selectedInstance;

// Prefer the rendered badge label (designers may override it); fall back to the variant name.
const label = instance.findText('Label', { path: ['badge'] });
const name =
  label.type === 'TEXT' && label.textContent
    ? label.textContent
    : instance.getEnum('Name', { AWS: 'AWS', GCP: 'GCP', Azure: 'Azure', VPN: 'VPN', DC: 'DC' });

const example = figma.code`<IpProvider>${name}</IpProvider>`;

export default {
  id: 'ip-provider',
  example,
  imports: ["import { IpProvider } from '@wallarm-org/design-system/Ip';"],
  metadata: { nestable: true },
};
