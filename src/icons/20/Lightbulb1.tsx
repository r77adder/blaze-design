import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const Lightbulb1 = forwardRef<SVGSVGElement, IconProps>(
  ({ color = 'currentColor', size = 20 }, forwardedRef) => {
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
          d="M8 18H12M8.5 8H11.5M5 7C5 4.23858 7.23858 2 10 2C12.7614 2 15 4.23858 15 7C15 9.05032 13.7659 10.7284 12 11.5V14.5C12 15.0523 11.5523 15.5 11 15.5H9C8.44772 15.5 8 15.0523 8 14.5V11.584C6.2341 10.8124 5 9.05032 5 7Z"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
  },
)

export default Lightbulb1
