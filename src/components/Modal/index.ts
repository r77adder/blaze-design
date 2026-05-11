import { Modal as Root } from './Modal'
import { Header } from './Header'
import { Top } from './Top'
import { BackButton } from './BackButton'
import { Content } from './Content'
import { Footer, FooterContent, FooterButton, FooterButtonLink } from './Footer'
import { ListSection } from './mobile/ListSection'
import { ListItem } from './mobile/ListItem'

export const Modal = {
  Root,
  Header,
  Top,
  BackButton,
  Content,
  Footer,
  FooterContent,
  FooterButton,
  FooterButtonLink,
  ListSection,
  ListItem,
}

export { type StackModalProps } from './Types'
export { ModalStack, useModals } from './ModalStack'
