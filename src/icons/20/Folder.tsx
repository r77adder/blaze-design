import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const Folder = forwardRef<SVGSVGElement, IconProps>(({ color = 'currentColor', size = 20 }, forwardedRef) => {
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
        d="M2.00086 7.0139L2.00078 14.6175C2.00077 15.7221 2.8962 16.6175 4.00078 16.6175L15.9997 16.6175C17.1043 16.6176 17.9997 15.7222 17.9997 14.6176L18 6.84372C18 6.29142 17.5523 5.84369 17 5.84369H10.0697L7.76555 3.38232H3.00038C2.44794 3.38232 2.00017 3.82964 2.00034 4.38207C2.00058 5.16753 2.00086 6.2523 2.00086 7.0139Z"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
})

export default Folder
