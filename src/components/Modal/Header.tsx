import cx from 'classnames'

import { HeaderProps } from './Types'

import Styles from './Header.module.scss'
import { useResponsiveDesign } from '../../hooks'
import { MobileBackButton } from './MobileBackButton'
import { Heading } from '../Heading'
import { Button } from '../Button/Button'
import { IconButton } from '../IconButton/IconButton'
import Close from '../../icons/16/Close'
import { useModals } from './ModalStack'
import { BackButton } from './BackButton'

export const Header = ({
  className,
  size = 'lg',
  children,
  title,
  headingLevel = 2,
  actions,
  onClose,
  onBack,
  preventClose,
  id,
  variant = 'primary',
  heroImage,
  heroImageAlt,
  titleColor = 'var(--light-100)',
  compact = true,
  subHeader,
  isConfirmation = false,
}: HeaderProps) => {
  const { isMobile } = useResponsiveDesign()
  const { closeModal } = useModals()

  if (variant === 'hero') {
    return (
      <div
        className={cx(className, Styles.heroHeader, Styles[size], {
          [Styles.preventClose!]: preventClose,
        })}
      >
        <img src={heroImage} alt={heroImageAlt} className={Styles.image} />
        <div className={Styles.headingContainer}>
          <Heading level={headingLevel} color={titleColor}>
            {title}
          </Heading>
        </div>
        {isMobile && !preventClose && (
          <Button size="sm" onPress={onClose} variant="editor" color={titleColor}>
            Close
          </Button>
        )}
      </div>
    )
  }

  if (children) {
    return (
      <div
        className={cx(className, Styles.header, Styles[size], {
          [Styles.preventClose!]: preventClose,
          [Styles.compact!]: !isMobile && compact,
          [Styles.widthSubHeader!]: !isMobile && subHeader,
          [Styles.isConfirmation!]: isConfirmation,
        })}
      >
        {isMobile && !preventClose && !!actions && <MobileBackButton onPress={onClose} />}
        {children}
        {!isMobile && subHeader && <div className={Styles.subHeader}>{subHeader}</div>}
        {!isMobile && (
          <div className={Styles.actions}>
            {actions}
            {!preventClose && (
              <IconButton icon={Close} size="sm" variant="tertiary" onPress={onClose || closeModal} />
            )}
          </div>
        )}
        {isMobile && (
          <>
            {!!actions ? (
              <div className={Styles.actions}>{actions}</div>
            ) : (
              <>
                {!preventClose && (
                  <div className={Styles.backButtonRight}>
                    <MobileBackButton onPress={onClose}>Close</MobileBackButton>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    )
  }

  return (
    <div
      className={cx(className, Styles.header, Styles[size], {
        [Styles.preventClose!]: preventClose,
        [Styles.compact!]: !isMobile && compact,
        [Styles.widthSubHeader!]: !isMobile && subHeader,
        [Styles.isConfirmation!]: isConfirmation,
      })}
    >
      {isMobile ? (
        <>
          {!preventClose && !!actions && <MobileBackButton onPress={onClose} />}
          <span className={cx(Styles.title, { [Styles.noTitle!]: typeof title !== 'string' })} id={id}>
            {title}
          </span>
          {!!actions ? (
            <div className={Styles.actions}>{actions}</div>
          ) : (
            <>
              {!preventClose && (
                <div className={Styles.backButtonRight}>
                  <MobileBackButton onPress={onClose}>Close</MobileBackButton>
                </div>
              )}
            </>
          )}
        </>
      ) : (
        <>
          <div className={Styles.headerLeftContent}>
            {onBack && <BackButton onPress={onBack} size="sm" />}
            <Heading level={headingLevel} id={id}>
              {title}
            </Heading>
          </div>
          {!isMobile && subHeader && <div className={Styles.subHeader}>{subHeader}</div>}
          <div className={Styles.actions}>
            {actions}
            {!preventClose && (
              <IconButton icon={Close} size="sm" variant="tertiary" onPress={onClose || closeModal} />
            )}
          </div>
        </>
      )}
    </div>
  )
}
