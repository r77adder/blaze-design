import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const SupportBubble = forwardRef<SVGSVGElement, IconProps>(
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
          d="M4.16653 9.16667C4.16653 5.48477 7.15104 2.5 10.8326 2.5C14.5142 2.5 17.4987 5.48477 17.4987 9.16667C17.4987 10.125 17.2965 11.0361 16.9325 11.8597L17.5 15.8327L14.0955 14.9815C13.131 15.5239 12.018 15.8333 10.8326 15.8333M2.50079 13.3333C2.50079 13.9323 2.62715 14.5018 2.85467 15.0165L2.5 17.4996L4.62762 16.9676C5.23036 17.3066 5.92596 17.5 6.66671 17.5C8.96748 17.5 10.8326 15.6345 10.8326 13.3333C10.8326 11.0321 8.96748 9.16667 6.66671 9.16667C4.36594 9.16667 2.50079 11.0321 2.50079 13.3333Z"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
  },
)

export default SupportBubble
