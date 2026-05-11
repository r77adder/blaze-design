import React, { useRef, RefObject } from 'react';
import { AriaButtonOptions, ButtonAria, useButton } from '@react-aria/button';

import {
  ButtonHTMLAttributes,
  AnchorHTMLAttributes,
  HTMLAttributes,
  InputHTMLAttributes,
  DOMAttributes,
  ElementType,
} from 'react';

// Utility type: Given an element type, what is the proper ref type?
type ButtonRef<E extends ElementType> = E extends 'button'
  ? HTMLButtonElement
  : E extends 'a'
  ? HTMLAnchorElement
  : E extends 'div'
  ? HTMLDivElement
  : E extends 'input'
  ? HTMLInputElement
  : E extends 'span'
  ? HTMLSpanElement
  : Element;

// Utility type: Map an element type to its appropriate attributes.
type ButtonAttributes<E extends ElementType> = E extends 'button'
  ? ButtonHTMLAttributes<HTMLButtonElement>
  : E extends 'a'
  ? AnchorHTMLAttributes<HTMLAnchorElement>
  : E extends 'div'
  ? HTMLAttributes<HTMLDivElement>
  : E extends 'input'
  ? InputHTMLAttributes<HTMLInputElement>
  : E extends 'span'
  ? HTMLAttributes<HTMLSpanElement>
  : DOMAttributes<Element>;

type Props = {
  threshold?: number;
};

/**
 * This hooks wraps react-aria's `useButton` and will prevent pressing the button if
 * the pointerUp event is further away than the `threshold`.
 * This is mainly to support IOS (only reproducible on a phone, not the simulator), which
 * will trigger the button if it happens to be below your finger while scrolling
 */
function useButtonWithScrollCancel<E extends ElementType = 'button'>(
  props: AriaButtonOptions<E> & Props,
  ref: RefObject<ButtonRef<E>>,
): ButtonAria<ButtonAttributes<E>> {
  const { threshold = 10, ...originalProps } = props;
  const { buttonProps, ...rest } = useButton(originalProps, ref);

  const startPosition = useRef<{ x: number; y: number } | null>(null);
  const moved = useRef<boolean>(false);

  const handlePointerDown = (e: React.PointerEvent<ButtonRef<E>>) => {
    startPosition.current = { x: e.clientX, y: e.clientY };
    moved.current = false;
    buttonProps.onPointerDown && buttonProps.onPointerDown(e as any);
  };

  const handlePointerMove = (e: React.PointerEvent<ButtonRef<E>>) => {
    if (startPosition.current) {
      const dx = e.clientX - startPosition.current.x;
      const dy = e.clientY - startPosition.current.y;
      if (Math.sqrt(dx * dx + dy * dy) > threshold) {
        moved.current = true;
      }
    }
    buttonProps.onPointerMove && buttonProps.onPointerMove(e as any);
  };

  const handlePointerUp = (e: React.PointerEvent<ButtonRef<E>>) => {
    if (moved.current) {
      // Dispatch a pointercancel event on the element to reset the
      // react-aria `usePress` internal state
      if (ref.current) {
        const cancelEvent = new PointerEvent('pointercancel', e.nativeEvent);
        ref.current.dispatchEvent(cancelEvent);
      }
      e.preventDefault();
      e.stopPropagation();
      return;
    }

    buttonProps.onPointerUp && buttonProps.onPointerUp(e as any);
  };

  const modifiedButtonProps = {
    ...buttonProps,
    onPointerDown: handlePointerDown,
    onPointerMove: handlePointerMove,
    onPointerUp: handlePointerUp,
  } as ButtonAttributes<E>;

  return { buttonProps: modifiedButtonProps, ...rest };
}

export default useButtonWithScrollCancel;
