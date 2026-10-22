import type { FC, ReactNode, Ref } from 'react';
import { cn } from '../../utils/cn';
import { useTestId } from '../../utils/testId';
import { Switch, SwitchControl, SwitchLabel, type SwitchProps } from '../Switch';
import { chatPermissionsItemDescriptionVariants, chatPermissionsItemVariants } from './classes';

export interface ChatPermissionsItemProps extends Omit<SwitchProps, 'children' | 'title'> {
  ref?: Ref<HTMLLabelElement>;
  /** Tool name, e.g. `propose_add_to_denylist`. */
  title: ReactNode;
  description?: ReactNode;
}

export const ChatPermissionsItem: FC<ChatPermissionsItemProps> = ({
  title,
  description,
  className,
  'data-testid': testIdProp,
  ...rest
}) => {
  const testId = useTestId('item', testIdProp);

  return (
    <Switch
      {...rest}
      data-slot='chat-permissions-item'
      data-testid={testId}
      className={cn(chatPermissionsItemVariants(), className)}
    >
      <span className='flex min-w-0 flex-1 flex-col'>
        <SwitchLabel>{title}</SwitchLabel>
        {description != null && (
          <span className={chatPermissionsItemDescriptionVariants()}>{description}</span>
        )}
      </span>
      <SwitchControl />
    </Switch>
  );
};

ChatPermissionsItem.displayName = 'ChatPermissionsItem';
