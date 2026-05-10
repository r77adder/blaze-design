import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const UserProfiles = forwardRef<SVGSVGElement, IconProps>(
  ({ color = 'currentColor', size = 20 }, forwardedRef) => {
    return (
      <svg
        width={size}
        height={size}
        viewBox={`0 0 21 20`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        ref={forwardedRef}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="21" height="20" viewBox="0 0 21 20" fill="none">
          <path
            d="M14.0542 17.1424L14.0545 14.4642C14.0546 12.9849 12.8554 11.7856 11.3761 11.7856H5.37839C3.89928 11.7856 2.70017 12.9846 2.70001 14.4637L2.69971 17.1424M18.6995 17.1425L18.6997 14.4644C18.6998 12.985 17.5006 11.7857 16.0213 11.7857M13.5383 3.38384C14.1961 3.87187 14.6223 4.65425 14.6223 5.53619C14.6223 6.41813 14.1961 7.20051 13.5383 7.68854M11.1112 5.53605C11.1112 7.01527 9.91205 8.21443 8.43283 8.21443C6.9536 8.21443 5.75444 7.01527 5.75444 5.53605C5.75444 4.05682 6.9536 2.85767 8.43283 2.85767C9.91205 2.85767 11.1112 4.05682 11.1112 5.53605Z"
            stroke={color}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </svg>
    )
  },
)

export default UserProfiles
