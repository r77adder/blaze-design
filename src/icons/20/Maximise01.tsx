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
        d="M2.22461 6.56946H6.56944V2.22463M6.56944 6.56946L1.50049 1.50049M12.7757 8.43066H8.43091V12.7755M8.43091 8.43066L13.4999 13.4996"
        stroke={color}
        strokeWidth="1.15"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
})

export default Maximise01
