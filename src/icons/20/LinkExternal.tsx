import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const LinkExternal = forwardRef<SVGSVGElement, IconProps>(
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
          d="M9.0625 2.5H5.3125C3.7592 2.5 2.5 3.75919 2.5 5.31248V14.6875C2.5 16.2408 3.7592 17.5 5.3125 17.5H14.6875C16.2408 17.5 17.5 16.2408 17.5 14.6875V10.9375M12.812 2.50023L17.5 2.5M17.5 2.5V6.71884M17.5 2.5L9.53056 10.4685"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
  },
)

export default LinkExternal
