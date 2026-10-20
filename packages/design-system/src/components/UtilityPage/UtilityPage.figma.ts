// url=https://www.figma.com/design/VKb5gW46uSGw0rqrhZsbXT/WADS-Components?node-id=10786-8876
// source=https://github.com/wallarm/design-system/blob/main/packages/design-system/src/components/UtilityPage/UtilityPage.tsx
// component=UtilityPage
import figma from 'figma';

const instance = figma.selectedInstance;

// No TEXT props in Figma: read the Wording layers by name, falling back to the Type preset.
const text = (layer: string | undefined, fallback: string): string => {
  if (!layer) return fallback;
  const node = instance.findText(layer, { traverseInstances: true });
  return node.type === 'TEXT' ? node.textContent : fallback;
};

const SUBTITLE = "This page doesn't exist";
const ON_OUR_SIDE =
  'On our side, not yours. Your protection is still running — the console just hiccuped.';
const ROLE =
  "Your role doesn't include this page. If you think it should, your admin can fix that.";

// [subtitle layer, description layer, fallback description]. Common has no description
// layer in Figma, so the required prop gets a placeholder.
const preset = instance.getEnum('Type', {
  Common: ['text', undefined, 'Description'],
  '404': [SUBTITLE, 'Sign in to your account', 'Check the link or head back home.'],
  '403': [SUBTITLE, ROLE, ROLE.replace("'", '’')],
  '500': [SUBTITLE, ON_OUR_SIDE, ON_OUR_SIDE],
  Offline: [
    SUBTITLE,
    ON_OUR_SIDE,
    'Your protection isn’t affected — it runs outside this tab. We’ll reconnect automatically.',
  ],
}) ?? ['text', undefined, 'Description'];

const title = text('Welcome back!', 'Title');
const subtitle = text(preset[0], 'Subtitle');
const description = text(preset[1], preset[2] ?? 'Description');

const actions = instance
  .findConnectedInstances(node => node.codeConnectId() === 'button', { traverseInstances: true })
  .map(button => button.executeTemplate().example);

// JSON.stringify keeps any quotes in the copy from breaking the JSX attribute.
const example = figma.code`<UtilityPage
  title={${JSON.stringify(title)}}
  subtitle={${JSON.stringify(subtitle)}}
  description={${JSON.stringify(description)}}
>
  ${actions}
</UtilityPage>`;

export default {
  id: 'utility-page',
  example,
  imports: ["import { UtilityPage } from '@wallarm-org/design-system/UtilityPage';"],
  metadata: { nestable: false },
};
