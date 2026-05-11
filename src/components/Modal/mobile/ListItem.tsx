import cx from 'classnames'
import Styles from './ListItem.module.scss'
import { Button } from '../../Button/Button'
import ChevronRight from '../../../icons/16/ChevronRight'
import { useResponsiveDesign } from '../../../hooks'
import { ReactNode } from 'react'

export interface Props {
  itemKey: string
  itemLabel: string | ReactNode
  isSelected?: boolean
  onClick?: (key: string) => void
  icon?: ReactNode
  className?: string
}

export const ListItem = ({ itemKey, itemLabel, onClick, isSelected = false, icon, className }: Props) => {
  const { isMobile } = useResponsiveDesign()

  return (
    <li key={itemKey} className={cx(Styles.listItem, className)} data-testid={`folder-settings-nav-${itemKey}`}>
      <Button
        variant="tertiary"
        className={cx(Styles.itemLabel, { [Styles.isSelected!]: isSelected })}
        onPress={() => onClick?.(itemKey)}
      >
        {icon}
        {itemLabel}
      </Button>
      {isMobile && <ChevronRight />}
    </li>
  )
}
