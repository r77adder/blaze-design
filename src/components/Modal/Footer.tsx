import cx from 'classnames'
import { Children, ReactElement, forwardRef, useRef } from 'react'
import Styles from './Footer.module.scss'
import { FooterContentProps, FooterProps } from './Types'
import { useResponsiveDesign } from '../../hooks'
import { ButtonLinkProps, ButtonProps } from '../Button/Types'
import { Button } from '../Button/Button'
import { ButtonLink } from '../Button/ButtonLink'
import { useIntersection } from 'react-use'

export const Footer = ({
  children,
  blaze,
  vertical,
  className,
  withContentBackground,
  sticky = false,
  blur = false,
  isConfirmation = false,
}: FooterProps) => {
  const { isMobile } = useResponsiveDesign()
  const childrenArray = Children.toArray(children).filter(Boolean) as ReactElement[]

  const right = childrenArray.find((child) => child.props.slot === 'right' || !child.props.slot)
  const left = childrenArray.find((child) => child.props.slot === 'left')
  const center = childrenArray.find((child) => child.props.slot === 'center')

  const ref = useRef<HTMLDivElement | null>(null)
  const observer = useIntersection(ref, {})
  const isFixed = Boolean(observer && !observer.isIntersecting)

  return (
    <>
      <div
        className={cx(Styles.footer, className, {
          [Styles.blaze!]: blaze,
          [Styles.sticky!]: sticky,
          [Styles.blur!]: blur,
          [Styles.withContentBackground!]: withContentBackground,
          [Styles.noCenter!]: !center,
          [Styles.vertical!]: vertical && !isMobile,
          [Styles.fixed!]: isFixed,
          [Styles.isConfirmation!]: isConfirmation,
        })}
      >
        <div className={cx(left?.props.className, Styles.slot)}>{left}</div>
        {center && <div className={cx(center?.props.className, Styles.slot, Styles.center)}>{center}</div>}
        <div className={cx(right?.props.className, Styles.slot, Styles.right)}>{right}</div>
      </div>
      <div ref={ref} aria-hidden />
    </>
  )
}

export const FooterContent = ({ children }: FooterContentProps) => <>{children}</>
export const FooterButton = (props: ButtonProps) => {
  const { isMobile } = useResponsiveDesign()

  return <Button {...props} size={isMobile ? 'xl' : props.size || 'lg'} />
}
export const FooterButtonLink = forwardRef<HTMLAnchorElement, ButtonLinkProps>((props, fRef) => {
  const { isMobile } = useResponsiveDesign()

  return <ButtonLink {...props} size={isMobile ? 'xl' : props.size || 'lg'} ref={fRef} />
})
