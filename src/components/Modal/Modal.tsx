import { FocusScope } from '@react-aria/focus'
import { usePress } from '@react-aria/interactions'
import cx from 'classnames'
import { forwardRef, KeyboardEventHandler } from 'react'

import { useForwardRef } from '../../hooks'

import { useModals } from './ModalStack'
import { ModalProps } from './Types'

import Styles from './Modal.module.scss'
import { AriaLabelingProps } from '@react-types/shared'

export const Modal = forwardRef<
  HTMLDivElement,
  ModalProps & Pick<AriaLabelingProps, 'aria-labelledby' | 'aria-describedby' | 'aria-label'>
>(
  (
    {
      size = 'sm',
      blaze = false,
      isKeyboardDismissDisabled = false,
      children,
      withDefaultBg = false,
      onClose,
      onPressOutside,
      height,
      wrapperClassName,
      bodyClassName,
      'aria-describedby': ariaDescribedBy,
      'aria-labelledby': ariaLabelledBy,
      'aria-label': ariaLabel,
      'data-testid': dataTestId,
      wrapperRef,
      centered = true,
      restoreFocus = true,
    },
    _ref,
  ) => {
    const { closeModal, closeAllModals } = useModals()
    const ref = useForwardRef<HTMLDivElement>(_ref)

    const { pressProps: underlayPressProps } = usePress({
      onPress: () => {
        if (onPressOutside) {
          onPressOutside()
        } else {
          closeAllModals()
        }
      },
    })

    const onKeyDown: KeyboardEventHandler = (e) => {
      if (e.key === 'Escape' && !isKeyboardDismissDisabled) {
        e.stopPropagation()
        e.preventDefault()
        if (onClose) {
          onClose()
        } else {
          closeModal()
        }
      }
    }

    return (
      <div
        className={cx(
          Styles.wrapper,
          Styles[size],
          { [Styles.blaze!]: blaze, [Styles.uncentered!]: !centered },
          wrapperClassName,
        )}
        ref={wrapperRef}
      >
        <div className={Styles.underlay} {...underlayPressProps} data-testid="modal-underlay" />
        <FocusScope restoreFocus={restoreFocus} autoFocus>
          <div
            data-testid={dataTestId}
            onKeyDown={onKeyDown}
            className={cx(Styles.root, bodyClassName, {
              [Styles.flex!]: !!height,
              [Styles.withDefaultBg!]: withDefaultBg,
              [Styles.uncentered!]: !centered,
            })}
            ref={ref}
            role="dialog"
            aria-labelledby={ariaLabelledBy}
            aria-describedby={ariaDescribedBy}
            aria-label={ariaLabel}
            tabIndex={0}
            style={{ height }}
          >
            {children}
          </div>
        </FocusScope>
      </div>
    )
  },
)
