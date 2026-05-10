import { forwardRef } from 'react'
import { IconProps } from '../Types'
import HighDetailedMail from './HighDetailedMail'

export const DynamicHighDetailedMail = forwardRef<SVGSVGElement, IconProps>((props, forwardedRef) => {
  return <HighDetailedMail {...props} ref={forwardedRef} />
})

export default DynamicHighDetailedMail
