import { ReactNode, HTMLProps, FunctionComponent } from 'react';
import { AriaButtonProps } from '@react-types/button';
import { HoverProps, PressProps } from '@react-aria/interactions';
import { AriaLinkProps } from '@react-types/link';
import { LinkProps, NavLinkProps } from 'react-router-dom';
import { FocusEvents } from '@react-types/shared';

import type { Icon } from '../../icons/Types';
import { StyleProps } from '../../utils';

export type { Icon };

export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type ButtonVariant =
  | 'primary'
  | 'primary-colored'
  | 'secondary'
  | 'secondary-bg-agnostic'
  | 'tertiary'
  | 'subtle'
  | 'ghost'
  | 'ghost-tertiary'
  | 'editor'
  | 'danger'
  | 'red'
  | 'green';

interface BaseButtonProps {
  frontIcon?: Icon;
  endIcon?: Icon;
  iconClassName?: string;
  size?: ButtonSize;
  variant?: ButtonVariant;
  useChildClass?: boolean;
  fullWidth?: boolean;
  rounded?: boolean;
  square?: boolean;
  vertical?: boolean;
  className?: string;
}

// Newer @react-types/shared (3.34.x) added `onClick` to PressEvents (typed as
// MouseEvent<FocusableElement>). Prod was on shared@3.23.x which didn't define
// it. We omit react-aria's `onClick` so prod's legacy `onClick?: MouseEvent<HTMLButtonElement>`
// signature wins. Same trick is used in BaseButtonLinkProps below.
export interface ButtonProps extends BaseButtonProps, Omit<AriaButtonProps, 'onClick'>, Omit<HoverProps, 'onClick'>, StyleProps {
  title?: string;
  color?: string;
  /**
   * @deprecated onClick is deprecated, use onPress instead
   */
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  onMouseEnter?: (event: React.MouseEvent) => void;
  withChevron?: 'up' | 'down';
  chevronSize?: number;
  forceActive?: boolean;
  preventFocusOnPress?: boolean;
  ignoreHover?: boolean;
  endIconClassName?: string;
  onPointerEnter?: (event: React.PointerEvent) => void;
  onPointerLeave?: (event: React.PointerEvent) => void;
}

export interface BaseButtonLinkProps
  extends BaseButtonProps,
    Omit<AriaLinkProps, 'onClick'>,
    Omit<PressProps, 'onClick'>,
    Omit<HoverProps, 'onClick'>,
    FocusEvents,
    StyleProps {
  frontIcon?: Icon;
  endIcon?: Icon;
  size?: ButtonSize;
  variant?: ButtonVariant;
  iconClassName?: string;
  children?: ReactNode;
  rounded?: boolean;
  to: LinkProps['to'];
}

type AnchorElementProps = Omit<
  HTMLProps<HTMLAnchorElement>,
  'size' | 'onBlur' | 'onFocus' | 'className' | 'download' | 'target' | 'onKeyDown' | 'onKeyUp' | 'onClick' | 'children'
>;

export interface HrefButtonLinkProps extends BaseButtonLinkProps, AnchorElementProps {
  elementType?: 'a';
}

export interface NavLinkButtonLinkProps
  extends BaseButtonLinkProps,
    Omit<
      NavLinkProps,
      | 'className'
      | 'onBlur'
      | 'onFocus'
      | 'download'
      | 'target'
      | 'onKeyDown'
      | 'onKeyUp'
      | 'onClick'
      | 'children'
    > {
  elementType: FunctionComponent<NavLinkProps>;
}

export interface LinkButtonLinkProps
  extends BaseButtonLinkProps,
    Omit<
      LinkProps,
      | 'className'
      | 'onBlur'
      | 'onFocus'
      | 'download'
      | 'target'
      | 'onKeyDown'
      | 'onKeyUp'
      | 'onClick'
      | 'children'
    > {
  elementType: FunctionComponent<LinkProps>;
}

export type ButtonLinkProps = HrefButtonLinkProps | NavLinkButtonLinkProps | LinkButtonLinkProps;
