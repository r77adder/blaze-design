import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const Type3 = forwardRef<SVGSVGElement, IconProps>(({ color = 'currentColor', size = 20 }, forwardedRef) => {
  return (
    <svg
      width={size}
      height={size}
      style={{ width: size, height: size }}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      ref={forwardedRef}
    >
      <path
        d="M8.50739 13.5H10.1034M10.1034 13.5H11.7734M10.1034 13.5V6.5M10.1034 6.5H7.5C7.22386 6.5 7 6.72386 7 7V7.73529M10.1034 6.5H12.5C12.7761 6.5 13 6.72386 13 7V7.94118M4 18H16C17.1046 18 18 17.1046 18 16V4C18 2.89543 17.1046 2 16 2H4C2.89543 2 2 2.89543 2 4V16C2 17.1046 2.89543 18 4 18Z"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
})

export default Type3
