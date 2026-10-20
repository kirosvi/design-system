// url=https://www.figma.com/design/VKb5gW46uSGw0rqrhZsbXT/WADS-Components?node-id=4738-17701
// source=https://github.com/wallarm/design-system/blob/main/packages/design-system/src/components/Ip/Ip.tsx
// component=Ip
import figma from 'figma';

const instance = figma.selectedInstance;

const ip = instance.getString('IP');
// The "+N addresses" link is rendered by IpList itself, so it only switches to the list form.
const moreIps = instance.getBoolean('More IPs');
// Flag is an external library component with no country property — show a placeholder code.
const providerLayer = instance.getBoolean('Provider')
  ? instance.findInstance('ip-provider', { path: ['IP Info'] })
  : undefined;
const provider =
  providerLayer?.type === 'INSTANCE' ? providerLayer.executeTemplate().example : undefined;

const row = figma.code`<Ip>
  <IpCountry code='US' />
  <IpAddress>${ip}</IpAddress>${
    provider
      ? figma.code`
  ${provider}`
      : ''
  }
</Ip>`;

const example = moreIps
  ? figma.code`<IpList>
  ${row}
  <Ip>
    <IpCountry code='DE' />
    <IpAddress>77.88.8.8</IpAddress>
  </Ip>
</IpList>`
  : row;

export default {
  id: 'ip',
  example,
  imports: [
    `import { Ip, IpAddress, IpCountry${moreIps ? ', IpList' : ''} } from '@wallarm-org/design-system/Ip';`,
  ],
  metadata: { nestable: true },
};
