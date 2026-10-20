// url=https://www.figma.com/design/VKb5gW46uSGw0rqrhZsbXT/WADS-Components?node-id=8971-1361
// source=https://github.com/wallarm/design-system/blob/main/packages/design-system/src/components/ParameterPath/ParameterPath.tsx
// component=ParameterPath
import figma from 'figma';

const instance = figma.selectedInstance;

// Path parts live in the `Slot` as private sub-components, so read them as layers.
// Known limitation: matched by default layer name — a renamed layer drops out of the snippet.
const isInstance = (name: string) => (node: figma.InstanceHandle | figma.TextHandle) =>
  node.type === 'INSTANCE' && node.name === name;

// Escape for a single-quoted JS string literal.
const quote = (value: string) => `'${value.replace(/[\\']/g, '\\$&')}'`;

const methodLayer = instance.findLayers(isInstance('http-method'))[0];
// Other / Rest have no HttpMethodName equivalent, so `method` is omitted for them.
const method =
  methodLayer?.type === 'INSTANCE'
    ? methodLayer.getEnum('Type', {
        Get: 'GET',
        Post: 'POST',
        Put: 'PUT',
        Patch: 'PATCH',
        Delete: 'DELETE',
        Head: 'HEAD',
        Options: 'OPTIONS',
      })
    : undefined;

const segments: string[] = [];
let encoding: string | undefined;
let attack = false;
for (const node of instance.findLayers(isInstance('_path-segment'))) {
  if (node.type !== 'INSTANCE') continue;
  const type = node.getEnum('Type', {
    Default: 'default',
    Higlighted: 'highlighted',
    Truncated: 'truncated',
    Encoding: 'encoding',
  });
  // Truncation is computed by the component from the available width.
  if (type === 'truncated') continue;
  if (type === 'encoding') {
    // The Encoding variant shows its own `BASE64` text layer, not the `Segment` property.
    const text = node.findText('BASE64');
    encoding = text.type === 'TEXT' ? text.textContent : undefined;
    continue;
  }
  segments.push(node.getString('Segment'));
  const rightIcon = node.getInstanceSwap('r-ic');
  // Code draws the bolt only on the last (highlighted) segment, so only the last one counts.
  attack =
    type === 'highlighted' &&
    node.getBoolean('Right ic') &&
    rightIcon?.type === 'INSTANCE' &&
    rightIcon.name === 'zap';
}

const segmentList = segments.map(quote).join(', ');

const example = figma.code`<ParameterPath${method ? figma.code` method='${method}'` : ''} segments={[${segmentList}]}${encoding ? figma.code` encoding=${quote(encoding)}` : ''}${attack ? figma.code` attack` : ''} />`;

export default {
  id: 'parameter-path',
  example,
  imports: ["import { ParameterPath } from '@wallarm-org/design-system/ParameterPath';"],
  metadata: { nestable: true },
};
