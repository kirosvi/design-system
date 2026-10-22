import { cva } from 'class-variance-authority';

export const chatPermissionsContentVariants = cva('w-320 gap-1 p-8');

export const chatPermissionsItemVariants = cva(
  'w-full items-start justify-between gap-4 rounded-6 px-8 py-6 hover:bg-states-primary-hover',
);

export const chatPermissionsItemDescriptionVariants = cva('truncate text-xs text-text-secondary');
