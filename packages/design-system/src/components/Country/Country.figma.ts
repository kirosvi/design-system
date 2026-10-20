// url=https://www.figma.com/design/VKb5gW46uSGw0rqrhZsbXT/WADS-Components?node-id=8404-104516
// source=https://github.com/wallarm/design-system/blob/main/packages/design-system/src/components/Country/Country.tsx
// component=Country
import figma from 'figma';

const instance = figma.selectedInstance;

// '#'=Multi holds nested 'country' instances (this same set) in its Slot — render each of them.
const multi = instance.getEnum('#', { '1': false, Multi: true });

// Figma's 'IP' text holds a free-form country name; code needs a typed ISO 3166-1 alpha-2 code,
// so a single country shows a fixed code (Poland, the Figma default) instead of the name.
// 'More' (+N tag) has no code equivalent and is not mapped.
const example = multi
  ? figma.code`${instance
      .findConnectedInstances(i => i.name === 'country')
      .map(i => i.executeTemplate().example)}`
  : figma.code`<Country code='PL'>
  <CountryFlag />
  <CountryName />
</Country>`;

export default {
  id: 'country',
  example,
  imports: [
    "import { Country, CountryFlag, CountryName } from '@wallarm-org/design-system/Country';",
  ],
  metadata: { nestable: true },
};
