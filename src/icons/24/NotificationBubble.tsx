import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const NotificationBubble = forwardRef<SVGSVGElement, IconProps>(
  ({ color = 'currentColor', size = 24 }, forwardedRef) => {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M13.6048 4.05097C13.2734 4.01733 12.9357 4 12.5931 4C8.12341 4 4.5 6.94965 4.5 10.5882C4.5 14.2268 8.12341 17.1765 12.5931 17.1765C13.2918 17.1765 13.9697 17.1044 14.6164 16.9689L17.6513 20V15.7647C19.0138 14.8434 20.1087 13.459 20.5 12M20.5 7.5C20.5 8.88071 19.3807 10 18 10C16.6193 10 15.5 8.88071 15.5 7.5C15.5 6.11929 16.6193 5 18 5C19.3807 5 20.5 6.11929 20.5 7.5Z"
          stroke={color}
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
  },
)

export default NotificationBubble
