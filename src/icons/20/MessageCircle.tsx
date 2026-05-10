import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const MessageCircle = forwardRef<SVGSVGElement, IconProps>(
  ({ color = 'currentColor', size = 20 }, forwardedRef) => {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 22 22"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ width: size, height: size }}
      >
        <path
          d="M18.2937 13.7737C18.7239 12.8004 18.9629 11.7236 18.9629 10.5911C18.9629 6.2398 15.4358 2.7124 11.0849 2.7124C6.73409 2.7124 3.20703 6.2398 3.20703 10.5911C3.20703 14.9423 6.73409 18.4697 11.0849 18.4697C12.4857 18.4697 13.8011 18.1041 14.9409 17.463L18.9644 18.469L18.2937 13.7737Z"
          stroke={color}
          strokeWidth="1.60123"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
  },
)

export default MessageCircle
