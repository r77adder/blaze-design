import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const CalendarPost = forwardRef<SVGSVGElement, IconProps>(
  ({ color = 'currentColor', size = 20 }, forwardedRef) => {
    return (
      <svg
        width={size}
        height={size}
        style={{ width: size, height: size }}
        viewBox="0 0 25 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        ref={forwardedRef}
      >
        <path
          d="M4.19995 8.07895V7.11576C4.19995 5.23219 5.65637 3.70525 7.45294 3.70525H18.2963M4.19995 8.07895V18.4842C4.19995 20.3678 5.65637 21.8947 7.45294 21.8947H12.441M4.19995 8.07895H21.5492V7.11576C21.5492 5.23219 20.0928 3.70525 18.2963 3.70525M18.2963 3.70525V2M7.2464 2V3.70546M18.5749 14.5371L15.2462 17.9301M10.8135 14.5371L21.1296 10.889C21.7649 10.6643 22.3744 11.2856 22.154 11.9332L18.5749 22.4484C18.3297 23.1688 17.3373 23.1885 17.0647 22.4785L15.4266 18.2113C15.3448 17.9982 15.1794 17.8296 14.9703 17.7462L10.784 16.0765C10.0874 15.7986 10.1067 14.7871 10.8135 14.5371Z"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
  },
)

export default CalendarPost
