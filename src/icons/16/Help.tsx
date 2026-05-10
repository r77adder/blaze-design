import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const Help = forwardRef<SVGSVGElement, IconProps>(({ color = 'currentColor', size = 16 }, forwardedRef) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      ref={forwardedRef}
    >
      <svg width={size} height={size} viewBox="0 0 16 17" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M7.99851 13.7V14.5M4.66663 5.74701C4.66663 3.95373 6.15901 2.5 7.99996 2.5C9.84091 2.5 11.3333 3.95373 11.3333 5.74701C11.3333 6.91446 10.7008 7.93801 9.75136 8.51023C8.88076 9.03494 7.99851 9.81684 7.99851 10.8333V10.8333"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </svg>
  )
})

export default Help
