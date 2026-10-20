// url=https://www.figma.com/design/VKb5gW46uSGw0rqrhZsbXT/WADS-Components?node-id=3087-29302
// source=https://github.com/wallarm/design-system/blob/main/packages/design-system/src/components/CodeEditor/CodeEditorRoot.tsx
// component=CodeEditorRoot
import figma from 'figma';

const instance = figma.selectedInstance;

const invalid = instance.getEnum('Error', { On: true });
const hasLabelAction = instance.getBoolean('Label action');

const label = instance.findInstance('input-label');
const labelText = label.type === 'INSTANCE' ? label.getString('Input label') : 'Label';
const required = label.type === 'INSTANCE' && label.getBoolean('Mandatory');
const optional = label.type === 'INSTANCE' && label.getBoolean('Optional');
const info = label.type === 'INSTANCE' && label.getBoolean('Info');
const hasDescription = label.type === 'INSTANCE' && label.getEnum('Description', { On: true });

const labelAction = instance.findInstance('_label-action');
const actionText = labelAction.type === 'INSTANCE' ? labelAction.getString('Action') : 'Action';
// _label-action Type=Other has no agreed FieldAction `type`; it falls back to the default link style.

const errorLayer = instance.findInstance('input-description', { path: ['input-label'] });
const hasErrorLayer = errorLayer.type === 'INSTANCE';
const errorText = hasErrorLayer ? errorLayer.getString('Error text') : 'An error message.';
const descriptionText = hasErrorLayer
  ? errorLayer.getString('Description')
  : 'This is an input description.';
// Field `invalid` styles only the label and FieldError — the editor has no invalid state of its own
// (editor-level errors go through CodeEditorRoot `diagnostics`, which has no Figma equivalent).
const footer = invalid
  ? figma.code`<FieldError>${errorText}</FieldError>`
  : hasDescription
    ? figma.code`<FieldDescription>${descriptionText}</FieldDescription>`
    : '';

const snippet = instance.findInstance('code-snippet');
const isSnippet = snippet.type === 'INSTANCE';
const code = isSnippet ? snippet.getString('Code') : '';
const hasHeader = isSnippet && snippet.getEnum('Header', { On: true });
const lineNumbers = isSnippet && snippet.getEnum('Line numbers', { On: true });
// ponytail: Figma has no line-count property; 10 is a placeholder for the collapsed height.
const maxLines = isSnippet ? snippet.getEnum('Show more', { On: 10 }) : undefined;

const actionsLayer =
  isSnippet && snippet.getBoolean('Actions') ? snippet.findInstance('_actions') : undefined;
const actions = actionsLayer?.type === 'INSTANCE' ? actionsLayer : undefined;
const actionButtons = actions
  ? figma.code`<CodeSnippetActions>
    ${actions.getBoolean('Copy') ? figma.code`<CodeSnippetCopyButton />` : ''}${actions.getBoolean('Wrap') ? figma.code`<CodeSnippetWrapButton />` : ''}${actions.getBoolean('Fullscreen') ? figma.code`<CodeSnippetFullscreenButton />` : ''}
  </CodeSnippetActions>`
  : '';

const codeProp = code ? figma.code` defaultValue={${JSON.stringify(code)}}` : '';

const example = figma.code`<Field${figma.helpers.react.renderProp('required', required)}${figma.helpers.react.renderProp('invalid', invalid)}>
  <FieldLabel>
    ${labelText}${required || optional ? figma.code`<FieldIndicator />` : ''}${
      info
        ? figma.code`<Tooltip>
      <TooltipTrigger>
        <Info />
      </TooltipTrigger>
      <TooltipContent>Additional information</TooltipContent>
    </Tooltip>`
        : ''
    }${hasLabelAction ? figma.code`<FieldAction>${actionText}</FieldAction>` : ''}
  </FieldLabel>
  <CodeEditorRoot${codeProp}${figma.helpers.react.renderProp('maxLines', maxLines)}>
    ${hasHeader && actionButtons ? figma.code`<CodeSnippetHeader>${actionButtons}</CodeSnippetHeader>` : actionButtons}
    <CodeEditorContent${figma.helpers.react.renderProp('lineNumbers', lineNumbers)} ${figma.helpers.react.renderProp('aria-label', labelText)} />
  </CodeEditorRoot>
  ${footer}
</Field>`;

export default {
  id: 'code-editor',
  example,
  imports: [
    "import { CodeEditorContent, CodeEditorRoot } from '@wallarm-org/design-system/CodeEditor';",
    "import { CodeSnippetActions, CodeSnippetCopyButton, CodeSnippetFullscreenButton, CodeSnippetHeader, CodeSnippetWrapButton } from '@wallarm-org/design-system/CodeSnippet';",
    "import { Field, FieldAction, FieldDescription, FieldError, FieldIndicator, FieldLabel } from '@wallarm-org/design-system/Field';",
    "import { Tooltip, TooltipContent, TooltipTrigger } from '@wallarm-org/design-system/Tooltip';",
    "import { Info } from '@wallarm-org/design-system/icons';",
  ],
  metadata: { nestable: true },
};
