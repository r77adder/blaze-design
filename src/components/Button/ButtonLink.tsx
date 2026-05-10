import React, { forwardRef } from 'react';
import cx from 'classnames';
import Styles from './Button.module.scss';

import { ButtonLinkProps } from './Types';
import { useLink } from '@react-aria/link';
import { useObjectRef } from '../../utils';
import { useHover } from '@react-aria/interactions';
import { mergeProps } from '@react-aria/utils';
import { useFocusRing } from '@react-aria/focus';
import { AriaLinkProps } from '@react-types/link';
import { useStyleProps } from '../../utils';
import { iconSizes } from './Button';

const ButtonLink = forwardRef<HTMLAnchorElement, ButtonLinkProps>((props, fRef) => {
  const ref = useObjectRef<HTMLAnchorElement>(fRef);
  const { linkProps, isPressed } = useLink(props as AriaLinkProps, ref);
  const { hoverProps, isHovered } = useHover({ ...props, isDisabled: false });
  const { isFocusVisible, focusProps } = useFocusRing();
  const { styleProps } = useStyleProps(props);

  const {
    children,
    elementType: Component = 'a',
    size = 'md',
    variant = 'primary',
    frontIcon: FrontIcon,
    endIcon: EndIcon,
    iconClassName,
    rounded,
    vertical,
  } = props;

  let newLinkProps;
  if (Component === 'a') {
    const { to: href, ...rest } = props;
    newLinkProps = { ...rest, href };
  }

  const {
    elementType,
    frontIcon,
    endIcon,
    onPress,
    iconClassName: _iconClassName,
    fullWidth,
    isDisabled,
    className,
    ...finalProps
  } = newLinkProps || props;

  const iconOnly = React.Children.count(children) < 1 && (!!FrontIcon || !!EndIcon);

  return (
    <Component
      {...mergeProps(finalProps, linkProps, hoverProps, focusProps)}
      className={cx(Styles.root, Styles[size], Styles[variant], Styles.link, className, {
        [Styles.hovered!]: isHovered,
        [Styles.disabled!]: isDisabled,
        [Styles.pressed!]: isPressed,
        [Styles.focused!]: isFocusVisible,
        [Styles.fullWidth!]: fullWidth,
        [Styles.rounded!]: rounded,
        [Styles.vertical!]: vertical,
        [Styles.withFrontIcon!]: !iconOnly && !!FrontIcon,
        [Styles.withEndIcon!]: !iconOnly && !!EndIcon,
      })}
      ref={ref}
      style={styleProps}
    >
      {FrontIcon && (
        <FrontIcon
          size={iconSizes[size]}
          aria-hidden="true"
          className={cx(Styles.frontIcon, iconClassName)}
        />
      )}
      {!!children && <span className={Styles.children}>{children}</span>}
      {EndIcon && (
        <EndIcon
          size={iconSizes[size]}
          aria-hidden="true"
          className={cx(Styles.endIcon, iconClassName)}
        />
      )}
    </Component>
  );
});

ButtonLink.displayName = 'ButtonLink';

export { ButtonLink };
