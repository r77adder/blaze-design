import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const Maximise01 = forwardRef<SVGSVGElement, IconProps>(({ color = 'currentColor', size = 20 }, forwardedRef) => {
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
        d="M13.4997 5.84483V1.5H9.15487M13.4997 1.5L8.43073 6.56897M1.50049 9.15517V13.5H5.84532M1.50049 13.5L6.56946 8.43103"
        stroke={color}
        strokeWidth="1.15"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
})

export default Maximise01
