import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const Hash2 = forwardRef<SVGSVGElement, IconProps>(({ color = 'currentColor', size = 20 }, forwardedRef) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 20 20`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      ref={forwardedRef}
    >
      <path
        d="M16.6667 13.3333H3.33333M16.6667 6.66667H3.33333M5.55555 16.6667L7.77778 3.33333M12.2222 16.6667L14.4444 3.33333"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  )
})

export default Hash2
