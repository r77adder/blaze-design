import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const UsersProfiles1 = forwardRef<SVGSVGElement, IconProps>(
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
          d="M13.3545 17.1424L13.3548 14.4642C13.3549 12.9849 12.1557 11.7856 10.6764 11.7856H4.67868C3.19957 11.7856 2.00047 12.9846 2.0003 14.4637L2 17.1424M17.9998 17.1425L18 14.4644C18.0001 12.985 16.8009 11.7857 15.3216 11.7857M12.8386 3.38384C13.4964 3.87187 13.9226 4.65425 13.9226 5.53619C13.9226 6.41813 13.4964 7.20051 12.8386 7.68854M10.4115 5.53605C10.4115 7.01527 9.21235 8.21443 7.73312 8.21443C6.25389 8.21443 5.05474 7.01527 5.05474 5.53605C5.05474 4.05682 6.25389 2.85767 7.73312 2.85767C9.21235 2.85767 10.4115 4.05682 10.4115 5.53605Z"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
  },
)

export default UsersProfiles1
