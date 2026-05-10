import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const ArrowDownRightSquareContained = forwardRef<SVGSVGElement, IconProps>(
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
          d="M12.7343 8.07932V12.7669M12.7343 12.7669H8.04684M12.7343 12.7669L7.65621 7.68869M14.6875 17.5L5.31248 17.5C3.75919 17.5 2.5 16.2408 2.5 14.6875L2.5 5.3125C2.5 3.7592 3.75919 2.5 5.31248 2.5L14.6875 2.5C16.2408 2.5 17.5 3.7592 17.5 5.3125V14.6875C17.5 16.2408 16.2408 17.5 14.6875 17.5Z"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
  },
)

export default ArrowDownRightSquareContained
