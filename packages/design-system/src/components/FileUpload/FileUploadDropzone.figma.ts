// url=https://www.figma.com/design/VKb5gW46uSGw0rqrhZsbXT/WADS-Components?node-id=12400-8762
// source=https://github.com/wallarm/design-system/blob/main/packages/design-system/src/components/FileUpload/FileUploadDropzone.tsx
// component=FileUploadDropzone
import figma from 'figma';

const instance = figma.selectedInstance;

// Hover is a CSS state; Disable is set on the parent root.
const disabled = instance.getEnum('State', { Disable: true });

export default {
  id: 'file-upload-dropzone',
  example: figma.code`<FileUpload${figma.helpers.react.renderProp('disabled', disabled)}>
  <FileUploadDropzone />
</FileUpload>`,
  imports: [
    "import { FileUpload, FileUploadDropzone } from '@wallarm-org/design-system/FileUpload';",
  ],
  metadata: { nestable: true },
};
