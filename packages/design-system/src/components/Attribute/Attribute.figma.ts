// url=https://www.figma.com/design/VKb5gW46uSGw0rqrhZsbXT/WADS-Components?node-id=8404-128512
// source=https://github.com/wallarm/design-system/blob/main/packages/design-system/src/components/Attribute/Attribute.tsx
// component=Attribute
import figma from 'figma';

const instance = figma.selectedInstance;

// 'Horizontal (Slot)' is a Figma-only slot wrapper; it renders the same as Horizontal.
const orientation = instance.getEnum('Layout', {
  Horizontal: 'horizontal',
  'Horizontal (Slot)': 'horizontal',
});

// Label props live on the private nested _attribute-label instance.
const labelLayer = instance.findInstance('_attribute-label');
const label = labelLayer.type === 'INSTANCE' ? labelLayer : undefined;
const labelText = label?.getString('Input label') ?? 'Label';
const hasDescription = label?.getEnum('Description', { On: true }) ?? false;
const descriptionLayer = label?.findText('This is an input description.', {
  traverseInstances: true,
});
const description =
  descriptionLayer?.type === 'TEXT' ? descriptionLayer.textContent : 'Description';
const hasLeftInfo = label?.getBoolean('Left icon') ?? false;
const hasRightInfo = label?.getBoolean('Right icon') ?? false;
const actionLayer = label?.getBoolean('Action') ? label.findConnectedInstance('link') : null;
const action = actionLayer?.type === 'INSTANCE' ? actionLayer.executeTemplate().example : undefined;

// Value content comes from the nested attribute-value instance (no Code Connect of its own).
const valueLayer = instance.findInstance('attribute-value');
const valueInst = valueLayer.type === 'INSTANCE' ? valueLayer : undefined;
const content = valueInst?.getEnum('Content', { Text: 'text', Empty: 'empty', Link: 'link' });
const textLayer = valueInst?.findText('Value', { traverseInstances: true });
const valueLink = content === 'link' ? valueInst?.findConnectedInstance('link') : null;

const valueChild =
  content === 'text' && textLayer?.type === 'TEXT'
    ? figma.code`<Text size='sm'>${textLayer.textContent}</Text>`
    : valueLink?.type === 'INSTANCE'
      ? valueLink.executeTemplate().example
      : figma.code`{/* value */}`;

const info = figma.code`
    <AttributeLabelInfo>Tooltip text</AttributeLabelInfo>`;

export default {
  id: 'attribute',
  example: figma.code`<Attribute${figma.helpers.react.renderProp('orientation', orientation)}>
  <AttributeLabel>${hasLeftInfo ? info : ''}
    ${labelText}${hasRightInfo ? info : ''}${
      action
        ? figma.code`
    ${action}`
        : ''
    }${
      hasDescription
        ? figma.code`
    <AttributeLabelDescription>${description}</AttributeLabelDescription>`
        : ''
    }
  </AttributeLabel>
  ${
    content === 'empty'
      ? figma.code`<AttributeValue />`
      : figma.code`<AttributeValue>
    ${valueChild}
  </AttributeValue>`
  }
</Attribute>`,
  imports: [
    "import { Attribute, AttributeLabel, AttributeLabelDescription, AttributeLabelInfo, AttributeValue } from '@wallarm-org/design-system/Attribute';",
    "import { Link } from '@wallarm-org/design-system/Link';",
    "import { Text } from '@wallarm-org/design-system/Text';",
  ],
  metadata: { nestable: true },
};
