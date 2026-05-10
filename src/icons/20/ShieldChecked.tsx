import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const ShieldChecked = forwardRef<SVGSVGElement, IconProps>(
  ({ color = 'currentColor', size = 20 }, forwardedRef) => {
    return (
      <svg
        width={size}
        height={size}
        style={{ width: size, height: size }}
        viewBox="0 0 20 21"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        ref={forwardedRef}
      >
        <path
          d="M8.92383 9.32266L10.4238 10.8227L13.4238 7.82266M4.92383 4.82266L9.58219 2.49348C10.4268 2.07119 11.4209 2.07118 12.2655 2.49348L16.9238 4.82266C16.9238 4.82266 16.9238 9.20266 16.9238 11.5127C16.9238 13.8227 14.7885 15.382 10.9238 17.8227C7.05916 15.382 4.92383 13.3227 4.92383 11.5127V4.82266Z"
          stroke={color}
          strokeOpacity="0.8"
          strokeWidth="1.25"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
  },
)

export default ShieldChecked
