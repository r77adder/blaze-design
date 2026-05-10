import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const ColumnVertical3 = forwardRef<SVGSVGElement, IconProps>(
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
        <path
          d="M7.58532 2.5L15.8562 2.5C16.764 2.5 17.5 3.23597 17.5 4.14384V15.8562C17.5 16.764 16.764 17.5 15.8562 17.5H7.58532M7.58532 2.5L4.14384 2.5C3.23597 2.5 2.5 3.23597 2.5 4.14384L2.5 15.8562C2.5 16.764 3.23597 17.5 4.14384 17.5H7.58532M7.58532 2.5V17.5M12.5939 2.5V17.5"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
  },
)

export default ColumnVertical3
