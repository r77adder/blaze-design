import cx from 'classnames'
import { ContentProps } from './Types'
import Styles from './Content.module.scss'
import { useResponsiveDesign } from '../../hooks'

export const Content = ({
  children,
  fillAvailableSpace,
  className,
  withoutFooter,
  compact = true,
  isConfirmation = false,
}: ContentProps) => {
  const { isMobile } = useResponsiveDesign()

  return (
    <div
      className={cx(Styles.content, className, {
        [Styles.fillAvailableSpace!]: fillAvailableSpace,
        [Styles.withoutFooter!]: withoutFooter,
        [Styles.compact!]: !isMobile && compact,
        [Styles.isConfirmation!]: isConfirmation,
      })}
    >
      {children}
    </div>
  )
}
