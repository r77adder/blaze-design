import { useRef } from 'react'
import { CSSTransition } from 'react-transition-group'
import { UnderlayProps } from './Types'
import Styles from './Underlay.module.scss'
import cx from 'classnames'

export const Underlay = ({ isVisible, variant = 'default' }: UnderlayProps) => {
  const nodeRef = useRef<HTMLDivElement>(null)

  return (
    <CSSTransition
      nodeRef={nodeRef}
      unmountOnExit
      in={isVisible}
      timeout={150}
      classNames={{
        enter: Styles.enter,
        enterActive: Styles.enterActive,
        exit: Styles.exit,
        exitActive: Styles.exitActive,
      }}
    >
      <div className={cx(Styles.underlay, Styles[variant])} ref={nodeRef} />
    </CSSTransition>
  )
}
