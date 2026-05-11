import cx from 'classnames'
import Styles from './ListSection.module.scss'
import { ReactNode } from 'react'

export interface Props {
  children: ReactNode
  title?: string
  className?: string
  headerClassName?: string
  listClassName?: string
}

export const ListSection = ({ children, title, className, headerClassName, listClassName }: Props) => (
  <div className={cx(Styles.listSection, className)}>
    {title && <h3 className={cx(Styles.header, headerClassName)}>{title}</h3>}
    <ul className={cx(Styles.optionsList, listClassName)}>{children}</ul>
  </div>
)
