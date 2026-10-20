// url=https://www.figma.com/design/VKb5gW46uSGw0rqrhZsbXT/WADS-Components?node-id=12188-1311
// source=https://github.com/wallarm/design-system/blob/main/packages/design-system/src/components/SearchInput/SearchInput.tsx
// component=SearchInput
import figma from 'figma';

const instance = figma.selectedInstance;
const { renderProp } = figma.helpers.react;

const size = instance.getEnum('Size', { Medium: 'medium', Small: 'small' });
const filled = instance.getEnum('Filled', { On: true });

// The text lives on the nested text-input → _text-box; it is the value when Filled, else the placeholder.
const layer = instance.findText('Placeholder', { traverseInstances: true });
const text = layer.type === 'TEXT' ? layer.textContent : undefined;

// renderProp quotes/escapes the text; it drops '' so fall back to an explicit empty value (value is required).
const value = (filled && text && renderProp('value', text)) || " value=''";
// 'Search' is the code default placeholder.
const placeholder = filled || text === 'Search' ? undefined : text;

const example = figma.code`<SearchInput${value} onChange={setValue}${renderProp('size', size)}${renderProp('placeholder', placeholder)} />`;

export default {
  id: 'search-input',
  example,
  imports: ["import { SearchInput } from '@wallarm-org/design-system/SearchInput';"],
  metadata: { nestable: true },
};
