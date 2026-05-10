import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const ChartMiddle = forwardRef<SVGSVGElement, IconProps>(
  ({ color = 'currentColor', size = 20 }, forwardedRef) => {
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
        <path d="M2.5 18V16.2222" stroke="#0179CF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M7.83398 18V11.7778" stroke="#0179CF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M13 18L13 7" stroke="#0179CF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        <path
          d="M18 18L18 2"
          stroke="black"
          strokeOpacity="0.08"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
  },
)

export default ChartMiddle
