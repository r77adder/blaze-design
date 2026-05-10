import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const Plus03 = forwardRef<SVGSVGElement, IconProps>(({ color = 'currentColor', size = 14 }, forwardedRef) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path
        d="M6.99995 4.19995L6.99995 9.79995M9.79995 6.99995L4.19995 6.99995"
        stroke="#20A14F"
        strokeWidth="1.15"
        strokeLinecap="round"
      />
    </svg>
  )
})

export default Plus03
