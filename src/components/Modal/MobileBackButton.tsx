import { ButtonProps } from '../Button/Types'
import { useModals } from './ModalStack'
import { Button } from '../Button/Button'

export const MobileBackButton = ({ children = 'Back', size = 'md', variant = 'ghost', onPress, ...rest }: ButtonProps) => {
  const { closeModal } = useModals()

  return (
    <Button aria-label="Go back" size={size} variant={variant} onPress={onPress || closeModal} {...rest}>
      {children}
    </Button>
  )
}
