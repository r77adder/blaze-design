import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const ArrowRightSquareContained = forwardRef<SVGSVGElement, IconProps>(
  ({ color = 'currentColor', size = 20 }, forwardedRef) => (
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
        d="M10.5199 6.68543L13.7499 10M13.7499 10L10.5199 13.3146M13.7499 10H6.65289M2.5 14.6875L2.5 5.31248C2.5 3.75919 3.75919 2.5 5.31249 2.5L14.6874 2.5C16.2407 2.5 17.4999 3.75919 17.4999 5.31249V14.6875C17.4999 16.2408 16.2407 17.5 14.6874 17.5H5.31248C3.75919 17.5 2.5 16.2408 2.5 14.6875Z"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
)

export default ArrowRightSquareContained
