import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const Scan = forwardRef<SVGSVGElement, IconProps>(({ color = 'currentColor', size = 20 }, forwardedRef) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      ref={forwardedRef}
    >
      <path
        d="M7.33333 2H3.77778C2.79594 2 2 2.79594 2 3.77778V7.33333M7.33333 18H3.77778C2.79594 18 2 17.2041 2 16.2222V12.6667M12.6667 2H16.2222C17.2041 2 18 2.79594 18 3.77778V7.33333M18 12.6667V16.2222C18 17.2041 17.2041 18 16.2222 18H12.6667M2 10.0002H18"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  )
})

export default Scan
