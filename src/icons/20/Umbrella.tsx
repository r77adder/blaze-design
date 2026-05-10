import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const Umbrella = forwardRef<SVGSVGElement, IconProps>(({ color = 'currentColor', size = 20 }, forwardedRef) => {
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
        d="M10.7272 10.5624L8.70797 14.0598M14.3893 3.26042C12.679 4.30395 9.21987 7.03343 9.06563 9.6031M15.22 3.74004C15.2093 5.76484 14.6395 10.1625 12.4458 11.5546M1.5 15.9912L3.61121 15.0624C4.90125 14.4949 6.32264 14.2935 7.71956 14.4804L7.78421 14.4891C9.20261 14.6788 10.5397 15.2614 11.6445 16.1709L13.3333 17.5611M5.55518 7.57634L15.8993 13.5485C16.4843 13.8863 17.2324 13.6858 17.5702 13.1008C19.4843 9.78547 18.3484 5.54621 15.0331 3.63211L14.5761 3.36828C11.2608 1.45419 7.02154 2.5901 5.10745 5.9054C4.76967 6.49046 4.97012 7.23856 5.55518 7.57634Z"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
})

export default Umbrella
