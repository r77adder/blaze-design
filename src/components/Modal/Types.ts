import { FocusScopeProps } from '@react-aria/focus'
import { HeadingLevel } from '../Heading'
import { ComponentPropsWithoutRef, ElementType, FunctionComponent, ReactElement, ReactNode, Ref } from 'react'

import { PressProps } from '@react-aria/interactions'

export interface Options {
  newStack?: boolean
  hideUnderlay?: boolean
  underlayVariant?:
    | 'light'
    | 'default'
    | 'dark'
    | 'wizard'
    | 'onboarding'
    | 'brandVoice'
    | 'heroes'
    | 'brandStyle'
    | 'walkthrough'
    | 'brandContent'
    | 'generatedContent'
    | 'virtualMarketer'
    | 'robot'
    | 'autopilotUpgrade'
    | 'mobileAutopilotUpgrade'
}

export type ModalComponentProps<C extends ElementType> = Omit<
  ComponentPropsWithoutRef<C>,
  keyof StackModalProps | 'children' | 'component'
>

interface StackModal<C extends ElementType> {
  component: C
  props?: ComponentPropsWithoutRef<C>
  options?: Options
}

export interface StackModalProps {
  /**
   * Whether the modal is currently on top of the stack
   */
  isOpen?: boolean

  /**
   * Close the modal
   * @returns void
   */
  close: () => void

  /**
   * Position of the modal in the stack
   */
  index: number
}

export type Stack = StackModal<FunctionComponent<React.PropsWithChildren<any>>>[]
export type OpenModalFunction = <C extends FunctionComponent<React.PropsWithChildren<any>>>(
  component: C,
  props?: ModalComponentProps<C>,
  options?: Options & { replace?: boolean | number },
) => void

export interface IStackManager {
  /**
   * The current stack
   */
  stack: Stack

  /**
   * Open a modal. The modal is pushed top of the stack.
   * @param component The modal component to open
   * @param props The props to pass to the modal component
   * @returns void
   */
  openModal: OpenModalFunction

  /**
   * Close the current modal. The modal is popped off the stack.
   * @returns void
   */
  closeModal: () => void

  /**
   * Close the last `count` modals. The modals are popped off the stack.
   * @returns void
   */
  closeModals: (count: number) => void

  /**
   * Close all the modals in the stack.
   * @returns void
   */
  closeAllModals: () => void

  /**
   * Close the latest stack. For a single stack this is equivalent to closeAllModals
   * @returns void
   */
  closeStack: () => void
  setStackButtonsContainer?: (node: HTMLDivElement | null) => void
  stackButtonsContainer?: HTMLDivElement | null
}

export interface ModalStackProviderProps {
  children: ReactNode

  /**
   * If passed, this stack manager will be used instead of the default one. This
   * is useful, for example, to share the stack across different react trees, or
   * for testing purposes.
   */
  stackManager?: IStackManager
}

export interface ModalProps {
  children?: ReactNode

  /**
   * The width of the modal
   */
  size?: 'xs' | 'xs-wide' | 'sm' | 'md' | 'lg' | 'fullscreen'

  /**
   * Whether to use new prospective styles
   */
  blaze?: boolean
  withDefaultBg?: Boolean

  /**
   * Whether the modal should not be dismissable with the ESC key
   */
  isKeyboardDismissDisabled?: boolean

  /**
   * An optional callback to invoke when the modal is closed. When not provided,
   * it will close the modal by calling the default closeModal method of the
   * stack manager.
   */
  onClose?: () => void

  /**
   * An optional callback to invoke when pressing outside the modal. When not
   * provided it will close all the modals by calling the default closeAllModals
   * method of the stack manager.
   */
  onPressOutside?: () => void

  /**
   * Fixed height for the modal.  Content will expand to fill this height.
   */
  height?: number | string

  /**
   * Sets a custom className for the wrapper
   * @default undefined
   * @type string
   */
  wrapperClassName?: string
  /**
   * Sets a custom className for the body
   * @default undefined
   * @type string
   */
  bodyClassName?: string

  'data-testid'?: string

  wrapperRef?: Ref<HTMLDivElement>

  /**
   * Whether the modal should be centered
   *
   * @default true
   * @type boolean
   */
  centered?: boolean

  /** Whether to restore the focus to the element that was focused when the
   * modal mounted, after the modal unmounts.
   */
  restoreFocus?: FocusScopeProps['restoreFocus']
}

export interface UnderlayProps {
  /**
   * Whether the underlay is visible
   */
  isVisible?: boolean

  variant?:
    | 'light'
    | 'default'
    | 'dark'
    | 'wizard'
    | 'onboarding'
    | 'brandVoice'
    | 'heroes'
    | 'brandStyle'
    | 'walkthrough'
    | 'brandContent'
    | 'generatedContent'
    | 'virtualMarketer'
    | 'robot'
    | 'autopilotUpgrade'
    | 'mobileAutopilotUpgrade'
}

type DefaultHeaderProps = {
  /**
   * The default "primary" variant props
   */
  variant?: 'primary' // Optional because it's the default
  title: ReactNode
  id?: string
  actions?: ReactNode
  children?: never
  onClose?: () => void
  preventClose?: boolean
  heroImage?: never
  heroImageAlt?: never
  titleColor?: never
}

type HeroHeaderProps = {
  /**
   * Hero variant of the header
   */
  variant: 'hero'
  title: ReactNode
  heroImage: string
  heroImageAlt: string
  id?: string
  children?: never
  onClose?: () => void
  actions?: never
  preventClose?: boolean
  titleColor?: string
}

type ChildrenHeaderProps = {
  /**
   * Primary variant with children instead of title
   */
  variant?: 'primary'
  children?: ReactNode
  title?: never
  id?: never
  actions?: ReactNode
  onClose?: () => void
  preventClose?: boolean
  heroImage?: never
  heroImageAlt?: never
  titleColor?: never
}

export type HeaderProps = {
  className?: string | null
  blaze?: boolean
  size?: 'sm' | 'lg'
  headingLevel?: HeadingLevel
  onBack?: () => void
  compact?: boolean
  subHeader?: ReactNode
  isConfirmation?: boolean
} & (DefaultHeaderProps | HeroHeaderProps | ChildrenHeaderProps)

export interface TopProps {
  children?: ReactNode
}

export interface FooterProps {
  blaze?: boolean
  sticky?: boolean
  blur?: boolean
  withContentBackground?: boolean
  className?: string
  vertical?: boolean
  children?: ReactElement | [ReactElement, ReactElement] | [ReactElement, ReactElement, ReactElement] | null | ReactNode
  isConfirmation?: boolean
}

export type FooterSlot = 'left' | 'right' | 'center'

export interface FooterContentProps {
  children?: ReactNode
  className?: string
  /**
   * The slot into which the children should be rendered. By default, renders in
   * the right slot.
   */
  slot?: FooterSlot
}

export interface ContentProps {
  blaze?: boolean
  children?: ReactNode
  fillAvailableSpace?: boolean
  className?: string
  withoutFooter?: boolean
  compact?: boolean
  isConfirmation?: boolean
}

export type ModalTriggerProps<C extends FunctionComponent<React.PropsWithChildren<any>>> = {
  modal: C
  children?: ReactNode
  options?: Options & { replace?: boolean | number }
} & ModalComponentProps<C> &
  PressProps
