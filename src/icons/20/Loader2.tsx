import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const Loader2 = forwardRef<SVGSVGElement, IconProps>(({ color = 'currentColor', size = 20 }, forwardedRef) => {
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
        d="M11.125 5.2876V2.2876M11.125 18.7876V14.7876M15.875 10.0376H17.625M2.375 10.0376H6.375M14.4841 6.67901L15.8755 5.2876M4.9372 16.2249L7.76563 13.3965M14.4841 13.3962L15.875 14.7871M4.9372 3.85028L7.76563 6.67871"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
})

export default Loader2
