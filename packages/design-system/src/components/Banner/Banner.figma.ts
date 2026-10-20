// url=https://www.figma.com/design/VKb5gW46uSGw0rqrhZsbXT/WADS-Components?node-id=7688-3741
// source=https://github.com/wallarm/design-system/blob/main/packages/design-system/src/components/Banner/Banner.tsx
// component=Banner
import figma from 'figma';

const instance = figma.selectedInstance;

const variant = instance.getEnum('Type', {
  Primary: 'primary',
  Secondary: 'secondary',
  Destructive: 'destructive',
  Info: 'info',
  Warning: 'warning',
});
const title = instance.getString('Title');
const text = instance.getString('Text');
const leftIcon = instance.getBoolean('Left icon');
const description = instance.getBoolean('Description');
const inlineAction = instance.getBoolean('Inline action');
const rightActions = instance.getBoolean('Right actions');
const closable = instance.getBoolean('Closable');

// destructive / info / warning render their status icon by default in code;
// primary / secondary render nothing unless the swapped icon is passed explicitly.
const hasDefaultIcon = variant === 'destructive' || variant === 'info' || variant === 'warning';
const customIcon = hasDefaultIcon ? undefined : instance.getInstanceSwap('l-ic');
// The nested icon template emits a bare `<Icon />`; BannerIcon's icons are size='lg'.
const customIconExample =
  customIcon?.type === 'INSTANCE'
    ? customIcon
        .executeTemplate()
        .example.map(section =>
          section.type === 'CODE'
            ? { ...section, code: section.code.replace(/ \/>$/, " size='lg' />") }
            : section,
        )
    : undefined;
const icon = !leftIcon
  ? ''
  : hasDefaultIcon
    ? figma.code`\n  <BannerIcon />`
    : customIconExample
      ? figma.code`\n  <BannerIcon icon={${customIconExample}} />`
      : '';

const linkText = instance.findText('Link', { traverseInstances: true });
const linkLabel = linkText.type === 'TEXT' ? linkText.textContent : 'Link';

const actions = rightActions
  ? instance
      .findConnectedInstances(node => node.name.startsWith('Button-'), {
        path: ['Container', 'Actions'],
      })
      .map(button => figma.code`\n    ${button.executeTemplate().example}`)
  : [];

const variantProp = variant === 'primary' ? '' : figma.helpers.react.renderProp('variant', variant);

export default {
  id: 'banner',
  example: figma.code`<Banner${variantProp}>${icon}
  <BannerContent>
    <BannerTitle${inlineAction ? figma.code` action={<BannerLink href='#'>${linkLabel}</BannerLink>}` : ''}>${title}</BannerTitle>${description ? figma.code`\n    <BannerDescription>${text}</BannerDescription>` : ''}
  </BannerContent>${
    rightActions || closable
      ? figma.code`\n  <BannerControls>${actions}${closable ? figma.code`\n    <BannerClose />` : ''}\n  </BannerControls>`
      : ''
  }
</Banner>`,
  imports: [
    "import { Banner, BannerClose, BannerContent, BannerControls, BannerDescription, BannerIcon, BannerLink, BannerTitle } from '@wallarm-org/design-system/Banner';",
  ],
  metadata: { nestable: true },
};
