import { forwardRef, PropsWithChildren } from 'react';
import { IconButtonProps } from './Types';
import { useHover } from '@react-aria/interactions';
import { useObjectRef } from '../../utils';
import { mergeProps } from '@react-aria/utils';
import { useResponsiveDesign } from '../../hooks';
import { Button } from '../Button/Button';

const IconButton = forwardRef<HTMLButtonElement, PropsWithChildren<IconButtonProps>>(
  ({ icon, children, active = false, variant = 'primary', size = 'md', ...props }, fRef) => {
    const ref = useObjectRef<HTMLButtonElement>(fRef);
    const { isMobile } = useResponsiveDesign();
    const { isDisabled, onHoverStart, onHoverEnd } = props;
    const { hoverProps } = useHover({
      isDisabled,
      onHoverStart,
      onHoverEnd,
    });

    return (
      <Button
        aria-label={props.title}
        {...mergeProps(props, hoverProps)}
        variant={variant}
        forceActive={active}
        size={size}
        ref={ref}
        frontIcon={children ? undefined : icon}
        preventFocusOnPress={isMobile || props.preventFocusOnPress}
      >
        {icon ? null : children}
      </Button>
    );
  },
);

IconButton.displayName = 'IconButton';

export { IconButton };
