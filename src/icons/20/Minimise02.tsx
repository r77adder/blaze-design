import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const Minimise02 = forwardRef<SVGSVGElement, IconProps>(({ color = 'currentColor', size = 20 }, forwardedRef) => {
  return (
    <svg
      width={size}
      height={size}
      style={{ width: size, height: size }}
      viewBox="0 0 15 15"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      ref={forwardedRef}
    >
      <path
        d="M6.56946 12.7757L6.56946 8.43091L2.22463 8.43091M6.56946 8.43091L1.50049 13.4999M8.43066 2.22414V6.56897L12.7755 6.56897M8.43066 6.56897L13.4996 1.5"
        stroke={color}
        strokeWidth="1.15"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
})

export default Minimise02
