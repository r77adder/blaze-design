import { useResponsiveDesign } from '../../hooks'
import Styles from './Header.module.scss'
import { TopProps } from './Types'

export const Top = ({ children }: TopProps) => {
  const { isMobile } = useResponsiveDesign()

  if (isMobile) return null
  return <div className={Styles.top}>{children}</div>
}
