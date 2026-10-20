// url=https://www.figma.com/design/VKb5gW46uSGw0rqrhZsbXT/WADS-Components?node-id=12413-17394
// source=https://github.com/wallarm/design-system/blob/main/packages/design-system/src/components/FilterDropdown/FilterDropdown.tsx
// component=FilterDropdown
// Type=Scope resolves to FilterCascade instead (source: FilterCascade/FilterCascade.tsx); the header
// can only name one code component per Figma node.
import figma from 'figma';

const instance = figma.selectedInstance;

const textOf = (layer: string, fallback: string) => {
  const handle = instance.findText(layer, { traverseInstances: true });
  return handle.type === 'TEXT' ? handle.textContent : fallback;
};

// Type=Scope is a hierarchical filter — FilterCascade in code, sharing the same trigger pill.
const type = instance.getEnum('Type', {
  'Single select': 'single',
  'Multi select': 'multi',
  Scope: 'scope',
});
const disabled = instance.getEnum('State', { Disabled: true });
const applied = instance.getEnum('Applied', { On: true });
// Scope's trigger text is a hard-coded 'Scope' layer, not bound to Name.
const name = type === 'scope' ? textOf('Scope', 'Scope') : instance.getString('Name');
// JSON.stringify keeps names with quotes valid JSX.
const label = ` label={${JSON.stringify(name)}}`;
// Single select shows `allLabel` while unset and the picked item's label once set — never `label`.
const allLabel = type === 'single' && !applied ? ` allLabel={${JSON.stringify(name)}}` : '';
const count = Math.max(1, Number(textOf('#', '2')) || 2);

// The trigger text is derived from the value; `defaultValue` only illustrates the applied look.
const defaultValue = !applied
  ? undefined
  : type === 'scope'
    ? figma.code` defaultValue={['deployment', 'application']}`
    : type === 'multi'
      ? ` defaultValue={${JSON.stringify(Array.from({ length: count }, (_, i) => `value-${i + 1}`))}}`
      : ` defaultValue={[${JSON.stringify(name)}]}`;

const example =
  type === 'scope'
    ? figma.code`<FilterCascade${label} collection={collection}${defaultValue ?? ''}${figma.helpers.react.renderProp('disabled', disabled)}>
  <FilterCascadeTrigger />
  <FilterCascadeContent />
</FilterCascade>`
    : figma.code`<FilterDropdown${label}${allLabel} collection={collection}${type === 'multi' ? ' multiple' : ''}${defaultValue ?? ''}${figma.helpers.react.renderProp('disabled', disabled)}>
  <FilterDropdownTrigger />
  <FilterDropdownContent>
    <FilterDropdownSearch />
    ${type === 'multi' ? '<FilterDropdownSelected>{item => <FilterDropdownOption item={item}>{item.label}</FilterDropdownOption>}</FilterDropdownSelected>' : '<FilterDropdownAllOption />'}
    {collection.items.map(item => (
      <FilterDropdownOption key={item.value} item={item}>
        {item.label}
      </FilterDropdownOption>
    ))}
    <FilterDropdownEmpty />
    <FilterDropdownFooter />
  </FilterDropdownContent>
</FilterDropdown>`;

export default {
  id: 'filter-dropdown',
  example,
  imports:
    type === 'scope'
      ? [
          "import { FilterCascade, FilterCascadeContent, FilterCascadeTrigger } from '@wallarm-org/design-system/FilterCascade';",
        ]
      : [
          `import { FilterDropdown, ${type === 'multi' ? '' : 'FilterDropdownAllOption, '}FilterDropdownContent, FilterDropdownEmpty, FilterDropdownFooter, FilterDropdownOption, FilterDropdownSearch, ${type === 'multi' ? 'FilterDropdownSelected, ' : ''}FilterDropdownTrigger } from '@wallarm-org/design-system/FilterDropdown';`,
        ],
  metadata: { nestable: true },
};
