import ArrowLeft from '../../icons/16/ArrowLeft'
import { useModals } from './ModalStack'
import { IconButton } from '../IconButton/IconButton'
import Styles from './BackButton.module.scss'
import { ButtonProps } from '../Button/Types'

export const BackButton = ({ onPress, ...rest }: ButtonProps) => {
  const { closeModal } = useModals()
  return (
    <div className={Styles.backButton}>
      <IconButton
        aria-label="Go back"
        icon={ArrowLeft}
        size="xs"
        variant="tertiary"
        onPress={onPress || closeModal}
        {...rest}
      />
    </div>
  )
}
