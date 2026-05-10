import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const MessageSquarePlus = forwardRef<SVGSVGElement, IconProps>(
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
          d="M5.56522 18L9.73913 13.8261H16C17.1046 13.8261 18 12.9307 18 11.8261V4C18 2.89543 17.1046 2 16 2H4C2.89543 2 2 2.89543 2 4V11.8261C2 12.9307 2.89543 13.8261 4 13.8261H5.56522V18Z"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M9.99992 10.9689V8.0001M9.99992 8.0001V5.03127M9.99992 8.0001H7.03109M9.99992 8.0001H12.9687"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
  },
)

export default MessageSquarePlus
