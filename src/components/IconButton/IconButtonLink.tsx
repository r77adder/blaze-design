import { forwardRef, PropsWithChildren } from 'react';
import { IconButtonLinkProps } from './Types';
import { useHover } from '@react-aria/interactions';
import { useObjectRef } from '../../utils';
import { mergeProps } from '@react-aria/utils';
import { useResponsiveDesign } from '../../hooks';
import { ButtonLink } from '../Button/ButtonLink';
import ChevronDown2 from '../../icons/20/ChevronDown2';
import ChevronUp from '../../icons/20/ChevronUp';

const IconButtonLink = forwardRef<HTMLAnchorElement, PropsWithChildren<IconButtonLinkProps>>(
  ({ icon, children, variant = 'primary', size = 'md', withChevron, ...props }, fRef) => {
    const ref = useObjectRef<HTMLAnchorElement>(fRef);
    const { isMobile } = useResponsiveDesign();
    const { isDisabled, onHoverStart, onHoverEnd } = props;
    const { hoverProps } = useHover({
      isDisabled,
      onHoverStart,
      onHoverEnd,
    });

    const Chevron = withChevron === 'down' ? ChevronDown2 : ChevronUp;

    return (
      <ButtonLink
        aria-label={props.title}
        {...mergeProps(props, hoverProps)}
        variant={variant}
        size={size}
        ref={ref}
        frontIcon={children ? undefined : icon}
        endIcon={!!withChevron ? () => <Chevron size={16} /> : undefined}
        preventFocusOnPress={isMobile || props.preventFocusOnPress}
      >
        {icon ? null : children}
      </ButtonLink>
    );
  },
);

IconButtonLink.displayName = 'IconButtonLink';

export { IconButtonLink };
