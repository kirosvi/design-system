// url=https://www.figma.com/design/bsqgrzkpIB2yPVlNpgU8jN/Wally-%E2%80%94-AI-Assistnat?node-id=26-726
// source=https://github.com/wallarm/design-system/blob/main/packages/design-system/src/components/MessageActions/MessageActions.tsx
// component=MessageActions
import figma from 'figma';

const instance = figma.selectedInstance;

const type = instance.getEnum('Type', { User: 'user', Wally: 'wally', None: 'none' });
// Hover is the revealed row; the latest Wally answer pins it on with `visible`.
const visible = instance.getEnum('State', { Default: undefined, Hover: true });
const visibleProp = figma.helpers.react.renderProp('visible', visible);

const timestamp = figma.code`<MessageTimestamp dateTime={createdAt}>{relativeTime}</MessageTimestamp>`;
const copy = figma.code`<Copyable text={text}>
    <MessageAction aria-label='Copy'>
      <CopyableIcon />
    </MessageAction>
  </Copyable>`;

// Type=None renders nothing (spec §3.7), so parent templates drop the actions row.
const example =
  type === 'none'
    ? figma.code``
    : type === 'user'
      ? figma.code`<MessageActions${visibleProp}>
  ${timestamp}
  ${copy}
</MessageActions>`
      : figma.code`<MessageActions${visibleProp}>
  ${copy}
  <MessageAction aria-label='Good response' aria-pressed={feedback === 'up'}>
    <ThumbsUp />
  </MessageAction>
  <MessageAction aria-label='Bad response' aria-pressed={feedback === 'down'}>
    <ThumbsDown />
  </MessageAction>
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <MessageAction aria-label='More actions'>
        <Ellipsis />
      </MessageAction>
    </DropdownMenuTrigger>
    <DropdownMenuContent>{/* menu items */}</DropdownMenuContent>
  </DropdownMenu>
  ${timestamp}
</MessageActions>`;

export default {
  id: 'bubble-actions',
  example,
  imports: [
    "import { MessageAction, MessageActions, MessageTimestamp } from '@wallarm-org/design-system/MessageActions';",
    "import { Copyable, CopyableIcon } from '@wallarm-org/design-system/Copyable';",
    ...(type === 'wally'
      ? [
          "import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@wallarm-org/design-system/DropdownMenu';",
          "import { Ellipsis, ThumbsDown, ThumbsUp } from '@wallarm-org/design-system/icons';",
        ]
      : []),
  ],
  metadata: { nestable: true },
};
