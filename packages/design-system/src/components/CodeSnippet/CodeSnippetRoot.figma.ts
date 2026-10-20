// url=https://www.figma.com/design/VKb5gW46uSGw0rqrhZsbXT/WADS-Components?node-id=2968-44318
// source=https://github.com/wallarm/design-system/blob/main/packages/design-system/src/components/CodeSnippet/CodeSnippetRoot.tsx
// component=CodeSnippetRoot
import figma from 'figma';

const instance = figma.selectedInstance;

// Escape for a JS template literal: backslash, backtick and `${`.
const escapedCode = instance.getString('Code').replace(/[`\\]/g, '\\$&').replace(/\$\{/g, '\\${');
const hasHeader = instance.getEnum('Header', { Off: false, On: true });
const hasLineNumbers = instance.getEnum('Line numbers', { Off: false, On: true });
const hasShowMore = instance.getEnum('Show more', { off: false, On: true });
const hasAnnotations = instance.getEnum('Annotations', { Off: false, On: true });
const hasFolding = instance.getEnum('Folding', { Off: false, On: true });
const hasHighlight = instance.getBoolean('Highlight');

// The per-action toggles live on the private nested `_actions` layer.
const actionsLayer = instance.getBoolean('Actions') ? instance.findInstance('_actions') : undefined;
const hasAction = (name: string) =>
  actionsLayer?.type === 'INSTANCE' && actionsLayer.getBoolean(name);
const actionButtons = [
  hasAction('Fullscreen') ? figma.code`<CodeSnippetFullscreenButton />` : '',
  hasAction('Wrap') ? figma.code`<CodeSnippetWrapButton />` : '',
  hasAction('Copy') ? figma.code`<CodeSnippetCopyButton />` : '',
];
const actions = actionButtons.some(Boolean)
  ? figma.code`<CodeSnippetActions>
    ${actionButtons}
  </CodeSnippetActions>`
  : '';

// Line tints live on the nested `_highlight-line-<n>` layers; `Style` maps 1:1 to LineColor.
const lineColors = {
  Error: 'danger',
  Warning: 'warning',
  Info: 'info',
  Neutral: 'neutral',
  Success: 'success',
  Brand: 'brand',
  ai: 'ai',
};
const highlighted: [number, string][] = [];
if (hasHighlight || hasAnnotations) {
  for (let n = 1; n <= 42; n++) {
    const line = instance.findInstance(`_highlight-line-${n}`, { path: ['highlight'] });
    const color = line.type === 'INSTANCE' ? line.getEnum('Style', lineColors) : undefined;
    if (color) highlighted.push([n, color]);
  }
  // No resolvable tint: fall back to an illustrative line.
  if (highlighted.length === 0) highlighted.push([2, 'warning']);
}

// Annotation prefix icon comes from the nested `_prefix` layer's `Note-ic` swap.
const prefixLayer = hasAnnotations
  ? instance.findInstance('_prefix', { path: ['prefix'] })
  : undefined;
const prefixIcon =
  prefixLayer?.type === 'INSTANCE' ? prefixLayer.getInstanceSwap('Note-ic') : undefined;
const prefix =
  prefixIcon?.type === 'INSTANCE'
    ? prefixIcon.executeTemplate().example
    : figma.code`<TriangleAlert />`;
const usesFallbackIcon = hasAnnotations && prefixIcon?.type !== 'INSTANCE';

const lines = highlighted.length
  ? figma.code`
  lines={{ ${highlighted.map(
    ([n, color], i) =>
      figma.code`${i ? ', ' : ''}${n}: { color: '${color}'${hasAnnotations ? figma.code`, prefix: ${prefix}` : ''} }`,
  )} }}`
  : '';
const folds = hasFolding
  ? figma.code`
  folds={[{ id: 'fold', startLine: 2, endLine: 4 }]}`
  : '';
// Header tab label: the TEXT layer inside the nested `_tab-item`.
const tabItem = hasHeader
  ? instance.findInstance('_tab-item', {
      path: ['header', 'tabs', 'Tabs', 'Slot 2'],
      traverseInstances: true,
    })
  : undefined;
const tabText = tabItem?.type === 'INSTANCE' ? tabItem.findText('Tab') : undefined;
const tabLabel = (tabText?.type === 'TEXT' && tabText.textContent) || 'Tab';
const tabValue = tabLabel.toLowerCase().replace(/[^a-z0-9]+/g, '-');

const maxLines = hasShowMore
  ? figma.code`
  maxLines={7}`
  : '';

const example = figma.code`<CodeSnippetRoot
  code={\`${escapedCode}\`}${lines}${folds}${maxLines}
>
  ${
    hasHeader
      ? figma.code`<CodeSnippetHeader>
    <CodeSnippetTabs defaultValue='${tabValue}'>
      <CodeSnippetTab value='${tabValue}'>${tabLabel}</CodeSnippetTab>
    </CodeSnippetTabs>
    ${actions}
  </CodeSnippetHeader>`
      : actions
  }
  <CodeSnippetContent>
    ${hasLineNumbers ? figma.code`<CodeSnippetLineNumbers />` : ''}
    <CodeSnippetCode />
  </CodeSnippetContent>
</CodeSnippetRoot>`;

export default {
  id: 'code-snippet',
  example,
  imports: [
    ...(usesFallbackIcon
      ? ["import { TriangleAlert } from '@wallarm-org/design-system/icons';"]
      : []),
    "import { CodeSnippetActions, CodeSnippetCode, CodeSnippetContent, CodeSnippetCopyButton, CodeSnippetFullscreenButton, CodeSnippetHeader, CodeSnippetLineNumbers, CodeSnippetRoot, CodeSnippetTab, CodeSnippetTabs, CodeSnippetWrapButton } from '@wallarm-org/design-system/CodeSnippet';",
  ],
  metadata: { nestable: true },
};
