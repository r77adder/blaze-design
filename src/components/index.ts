/**
 * The publishable lib surface. Only components that are 1:1 with
 * `apps/blaze/src/blaze-ui/` belong here. Anything that's a shared-across-
 * prototypes work-in-progress lives in `src/staging/` and is NOT exported.
 *
 * Promotion criterion: see `.claude/skills/promoting-staging-component.md`.
 */

export { Text } from './Text';
export type { TextProps, TextVariant } from './Text';

export { Heading } from './Heading';
export type { HeadingProps, HeadingLevel } from './Heading';

export { Paragraph } from './Paragraph';
export type { ParagraphProps } from './Paragraph';

export { Button, ButtonLink } from './Button';
export type { ButtonProps, ButtonSize, ButtonVariant, ButtonLinkProps, Icon } from './Button';

export { IconButton, IconButtonLink } from './IconButton';
export type { IconButtonProps, IconButtonLinkProps } from './IconButton';
