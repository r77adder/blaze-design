import { useModals } from './ModalStack'
import { PressResponder } from '@react-aria/interactions'
import { FunctionComponent, useCallback } from 'react'
import { ModalComponentProps, ModalTriggerProps } from './Types'
import { mergeProps } from '@react-aria/utils'

export function ModalTrigger<C extends FunctionComponent<React.PropsWithChildren<any>>>({
  modal,
  children,
  options,
  isDisabled,
  isPressed,
  preventFocusOnPress,
  onPress,
  onPressChange,
  onPressEnd,
  onPressStart,
  onPressUp,
  allowTextSelectionOnPress,
  shouldCancelOnPointerExit,
  ...rest
}: ModalTriggerProps<C>) {
  const { openModal } = useModals()

  const props = rest as ModalComponentProps<C>

  const handlePress = useCallback(() => {
    openModal(modal, props, ...(options !== undefined ? [options] : []))
  }, [openModal, modal, props, options])

  return (
    <PressResponder
      {...mergeProps(
        { onPress: handlePress },
        {
          isDisabled,
          isPressed,
          preventFocusOnPress,
          onPress,
          onPressChange,
          onPressEnd,
          onPressStart,
          onPressUp,
          allowTextSelectionOnPress,
          shouldCancelOnPointerExit,
        },
      )}
    >
      {children}
    </PressResponder>
  )
}
