// url=https://www.figma.com/design/VKb5gW46uSGw0rqrhZsbXT/WADS-Components?node-id=12403-10197
// source=https://github.com/wallarm/design-system/blob/main/packages/design-system/src/components/FileUpload/FileUploadItem.tsx
// component=FileUploadItem
import figma from 'figma';

const instance = figma.selectedInstance;

// Placeholder layer text ('{file-name}.{format}') falls back to a realistic value.
const textOr = (text: string | undefined, fallback: string) =>
  text && !text.startsWith('{') ? text : fallback;

const loading = instance.getEnum('State', { Loading: true });
const nameLayer = instance.findText('File Name');
const fileName = textOr(
  nameLayer.type === 'TEXT' ? nameLayer.textContent : undefined,
  'policy.wasm',
)
  .replace(/\\/g, '\\\\')
  .replace(/'/g, "\\'");
const descriptionLayer = instance.getEnum('Description', { On: true })
  ? instance.findText('{description-optional}')
  : undefined;
const description =
  descriptionLayer?.type === 'TEXT' ? textOr(descriptionLayer.textContent, '48 KB') : undefined;

// A stored-file row outside a FileUpload root (StoredFile story): Replace needs the root and
// renders nothing here, and Delete only runs the consumer's onClick.
export default {
  id: 'file-upload-item',
  example: figma.code`<FileUploadItemGroup>
  <FileUploadItem
    file={{ name: '${fileName}' }}${figma.helpers.react.renderProp('loading', loading)}${figma.helpers.react.renderProp('description', description)}
  >
    <FileUploadItemDeleteTrigger onClick={handleDelete} />
  </FileUploadItem>
</FileUploadItemGroup>`,
  imports: [
    "import { FileUploadItem, FileUploadItemDeleteTrigger, FileUploadItemGroup } from '@wallarm-org/design-system/FileUpload';",
  ],
  metadata: { nestable: true },
};
