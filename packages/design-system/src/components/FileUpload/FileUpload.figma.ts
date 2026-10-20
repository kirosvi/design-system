// url=https://www.figma.com/design/VKb5gW46uSGw0rqrhZsbXT/WADS-Components?node-id=12403-10372
// source=https://github.com/wallarm/design-system/blob/main/packages/design-system/src/components/FileUpload/FileUpload.tsx
// component=FileUpload
import figma from 'figma';

const instance = figma.selectedInstance;

const isButton = instance.getEnum('Type', { Button: true, Area: false });
const hasPicker = instance.getBoolean('Area');
const hasItems = instance.getBoolean('File items');
const labelLayer = instance.getBoolean('Label') ? instance.findInstance('input-label') : undefined;
const areaLayer = !isButton && hasPicker ? instance.findInstance('file-upload-area') : undefined;
const disabled =
  areaLayer?.type === 'INSTANCE' ? areaLayer.getEnum('State', { Disable: true }) : undefined;
const picker = isButton ? figma.code`<FileUploadTrigger />` : figma.code`<FileUploadDropzone />`;

const upload = figma.code`<FileUpload${figma.helpers.react.renderProp('disabled', disabled)}>
  ${hasPicker ? picker : ''}
  <FileUploadError />
  ${
    hasItems
      ? figma.code`<FileUploadItemGroup>
    {file => (
      <FileUploadItem file={file}>
        <FileUploadItemReplaceTrigger />
        <FileUploadItemDeleteTrigger />
      </FileUploadItem>
    )}
  </FileUploadItemGroup>`
      : ''
  }
</FileUpload>`;

let example = upload;
if (labelLayer?.type === 'INSTANCE') {
  const mandatory = labelLayer.getBoolean('Mandatory');
  const optional = labelLayer.getBoolean('Optional');
  example = figma.code`<Field${figma.helpers.react.renderProp('required', mandatory)}>
  <FieldLabel>
    ${labelLayer.getString('Input label')}
    ${mandatory || optional ? figma.code`<FieldIndicator />` : ''}
  </FieldLabel>
  ${upload}
</Field>`;
}

export default {
  id: 'file-upload',
  example,
  imports: [
    "import { Field, FieldIndicator, FieldLabel } from '@wallarm-org/design-system/Field';",
    "import { FileUpload, FileUploadDropzone, FileUploadError, FileUploadItem, FileUploadItemDeleteTrigger, FileUploadItemGroup, FileUploadItemReplaceTrigger, FileUploadTrigger } from '@wallarm-org/design-system/FileUpload';",
  ],
  metadata: { nestable: true },
};
