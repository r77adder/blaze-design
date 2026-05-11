import { useFocusRing } from '@react-aria/focus';
import { useHover } from '@react-aria/interactions';
import { filterDOMProps, mergeProps } from '@react-aria/utils';
import cx from 'classnames';
import { forwardRef } from 'react';
import { useObjectRef, ConditionalWrapper, useStyleProps } from '../../utils';
import { ButtonProps, ButtonSize } from './Types';
import type { AriaButtonOptions } from '@react-aria/button';
import Styles from './Button.module.scss';
import ChevronDown2 from '../../icons/20/ChevronDown2';
import { DOMProps } from '@react-types/shared';
import useButtonWithScrollCancel from '../../hooks/useButtonWithScrollCancel';

export const iconSizes: Record<ButtonSize, number> = {
  xs: 16,
  sm: 16,
  md: 16,
  lg: 18,
  xl: 24,
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(({ className, ...props }, fRef) => {
  const ref = useObjectRef<HTMLButtonElement>(fRef);
  // Cast: prod's deprecated `onClick?: MouseEvent<HTMLButtonElement>` differs in
  // variance from react-aria's newer `onClick?: MouseEvent<FocusableElement>`
  // (HTMLButtonElement is narrower). Behavior is unchanged — we just relax the
  // type at the hook boundary so prod's signature can stay.
  const { buttonProps, isPressed } = useButtonWithScrollCancel(props as AriaButtonOptions<'button'>, ref);
  const { hoverProps, isHovered } = useHover(props);
  const { isFocusVisible, focusProps } = useFocusRing();
  const { styleProps } = useStyleProps(props);

  const {
    children,
    size = 'md',
    variant = 'primary',
    iconClassName,
    useChildClass = false,
    frontIcon: FrontIcon,
    endIcon: EndIcon,
    isDisabled,
    title,
    withChevron,
    forceActive = false,
    ignoreHover = false,
    endIconClassName,
    fullWidth,
    rounded,
    square,
    vertical,
    justifyContent,
    ...finalProps
  } = props;

  const iconSize = iconSizes[size];

  return (
    <button
      title={title}
      {...mergeProps(
        filterDOMProps(finalProps),
        buttonProps,
        hoverProps,
        focusProps,
        (props.onPointerEnter
          ? { onPointerEnter: props.onPointerEnter, onPointerLeave: props.onPointerLeave }
          : {}) as DOMProps,
      )}
      className={cx(Styles.root, className, Styles[size], Styles[variant], {
        [Styles.hovered!]: !ignoreHover && isHovered,
        [Styles.pressed!]: isPressed || forceActive || props['aria-pressed'],
        [Styles.focused!]: isFocusVisible,
        [Styles.disabled!]: isDisabled,
        [Styles.fullWidth!]: fullWidth,
        [Styles.rounded!]: rounded,
        [Styles.square!]: square,
        [Styles.vertical!]: vertical,
        [Styles.iconButton!]: !children && (!!FrontIcon || !!EndIcon),
      })}
      ref={ref}
      style={styleProps}
    >
      {FrontIcon && <FrontIcon size={iconSize} className={Styles.frontIcon} />}
      <ConditionalWrapper
        condition={!!children && !useChildClass}
        wrapper={(children) => <span className={Styles.children}>{children}</span>}
      >
        {children}
      </ConditionalWrapper>
      {EndIcon && <EndIcon size={iconSize} className={Styles.endIcon} />}
      {!!withChevron && (
        <span className={cx(Styles.chevron, Styles[withChevron])}>
          <ChevronDown2 aria-hidden="true" size={15} />
        </span>
      )}
    </button>
  );
});

Button.displayName = 'Button';

export { Button };
