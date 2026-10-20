// url=https://www.figma.com/design/VKb5gW46uSGw0rqrhZsbXT/WADS-Components?node-id=5179-11016
// source=https://github.com/wallarm/design-system/blob/main/packages/design-system/src/components/HttpMethod/HttpMethod.tsx
// component=HttpMethod
import figma from 'figma';

const instance = figma.selectedInstance;

const knownMethod = instance.getEnum('Type', {
  Get: 'GET',
  Post: 'POST',
  Put: 'PUT',
  Patch: 'PATCH',
  Delete: 'DELETE',
  Head: 'HEAD',
  Options: 'OPTIONS',
  // Rest variant is an empty 41px frame in Figma (no badge/Label), so use a literal.
  Rest: 'REST',
});
// Other: code renders any string verbatim, so use the badge label text.
const label = instance.findText('Label', { traverseInstances: true });
const method = knownMethod ?? (label.type === 'TEXT' ? label.textContent : 'OTHER');

const example = figma.code`<HttpMethod method='${method}' />`;

export default {
  id: 'http-method',
  example,
  imports: ["import { HttpMethod } from '@wallarm-org/design-system/HttpMethod';"],
  metadata: { nestable: true },
};
