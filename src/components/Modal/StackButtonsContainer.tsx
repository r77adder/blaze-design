import Styles from './Modals.module.scss'
import { useModals } from './ModalStack'

export const StackButtonsContainer = () => {
  const { setStackButtonsContainer } = useModals()
  return <div className={Styles.stackButtons} ref={setStackButtonsContainer} />
}
