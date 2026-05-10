import { HoverEvent } from '@react-types/shared';
import { Icon } from '../../icons/Types';
import { ButtonLinkProps, ButtonProps } from '../Button/Types';

export interface IconButtonProps extends Omit<ButtonProps, 'frontIcon' | 'endIcon' | 'forceActive'> {
  active?: boolean;
  icon?: Icon;
  onHoverStart?: (e: HoverEvent) => void;
  onHoverEnd?: (e: HoverEvent) => void;
}

export interface IconButtonLinkProps extends Omit<ButtonLinkProps, 'frontIcon' | 'endIcon'> {
  withChevron?: 'up' | 'down';
  icon?: Icon;
  onHoverStart?: (e: HoverEvent) => void;
  onHoverEnd?: (e: HoverEvent) => void;
}
