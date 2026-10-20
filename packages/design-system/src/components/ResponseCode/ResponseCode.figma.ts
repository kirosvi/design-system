// url=https://www.figma.com/design/VKb5gW46uSGw0rqrhZsbXT/WADS-Components?node-id=5665-38780
// source=https://github.com/wallarm/design-system/blob/main/packages/design-system/src/components/ResponseCode/ResponseCode.tsx
// component=ResponseCode
import figma from 'figma';

const instance = figma.selectedInstance;

// Code derives the colour from the code itself, so Type only supplies a fallback sample.
const sample = instance.getEnum('Type', {
  Informational: '100',
  Success: '200',
  Redirection: '300',
  'Client Error': '400',
  'Server Error': '500',
});
const label = instance.findText('Label', { traverseInstances: true });
const code = (label.type === 'TEXT' && label.textContent.trim()) || sample || '200';
// Size lives on the nested badge; Medium is the code default.
const badge = instance.findInstance('badge');
const size =
  badge.type === 'INSTANCE' ? badge.getEnum('Size', { Small: 'small', Large: 'large' }) : undefined;

const codeValue = /^[1-9]\d*$/.test(code) ? code : JSON.stringify(code);
const example = figma.code`<ResponseCode code={${codeValue}}${figma.helpers.react.renderProp('size', size)} />`;

export default {
  id: 'response-code',
  example,
  imports: ["import { ResponseCode } from '@wallarm-org/design-system/ResponseCode';"],
  metadata: { nestable: true },
};
