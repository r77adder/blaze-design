import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const MessageSquareTyping = forwardRef<SVGSVGElement, IconProps>(
  ({ color = 'currentColor', size = 20 }, forwardedRef) => {
    return (
      <svg
        width={size}
        height={size}
        style={{ width: size, height: size }}
        viewBox="0 0 14 14"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        ref={forwardedRef}
      >
        <path
          d="M3.57519 5.13141V5.07501M6.57519 5.13141V5.07501M9.57519 5.13141V5.07501M6.37954 9.44458L3.24911 12.575V9.44458H2.0752C1.24677 9.44458 0.575195 8.773 0.575195 7.94458V2.07501C0.575195 1.24659 1.24677 0.575012 2.0752 0.575012H11.0752C11.9036 0.575012 12.5752 1.24659 12.5752 2.07501V7.94458C12.5752 8.773 11.9036 9.44458 11.0752 9.44458H6.37954Z"
          stroke={color}
          strokeOpacity={0.9}
          strokeWidth={1.15}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
  },
)

export default MessageSquareTyping
