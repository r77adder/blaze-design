import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const Send2 = forwardRef<SVGSVGElement, IconProps>(({ color = 'currentColor', size = 16 }, forwardedRef) => {
  return (
    <svg
      width={size}
      height={size}
      style={{ width: size, height: size }}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      ref={forwardedRef}
    >
      <path
        d="M13.9919 8.24982L4.18326 8.24982M3.36599 2.50402L13.6526 7.49146C14.2861 7.7986 14.2861 8.70104 13.6526 9.00818L3.36599 13.9956C2.66129 14.3373 1.91226 13.617 2.22617 12.8995L4.11259 8.58763C4.20681 8.37228 4.20681 8.12737 4.11259 7.91202L2.22617 3.60019C1.91226 2.88269 2.66129 2.16235 3.36599 2.50402Z"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  )
})

export default Send2
