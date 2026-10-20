// url=https://www.figma.com/design/VKb5gW46uSGw0rqrhZsbXT/WADS-Components?node-id=2983-55140
// source=https://github.com/wallarm/design-system/blob/main/packages/design-system/src/components/CodeSnippet/InlineCodeSnippet.tsx
// component=InlineCodeSnippet
import figma from 'figma';

const instance = figma.selectedInstance;

const code = instance.getString('Code');
const size = instance.getEnum('Size', { sm: 'sm', md: 'md', lg: 'lg' });

// `Label action` (BOOLEAN) has no code equivalent; pending designer confirmation. Not mapped to
// `copyable`, which already defaults to true.
// copyable defaults to true in code; Hover/Pressed states only exist on the copyable variant.
const example = figma.code`<InlineCodeSnippet code={${JSON.stringify(code)}}${figma.helpers.react.renderProp('size', size)} />`;

export default {
  id: 'inline-code-snippet',
  example,
  imports: ["import { InlineCodeSnippet } from '@wallarm-org/design-system/CodeSnippet';"],
  metadata: { nestable: true },
};
