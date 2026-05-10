import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const Check03 = forwardRef<SVGSVGElement, IconProps>(({ color = 'currentColor', size = 16 }, forwardedRef) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 16 16" fill="none">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M13.6389 3.62551C13.8458 3.80847 13.8651 4.12446 13.6821 4.33129L6.60523 12.3313C6.51032 12.4386 6.37396 12.5 6.23073 12.5C6.08749 12.5 5.95113 12.4386 5.85623 12.3313L2.31777 8.33129C2.1348 8.12446 2.15415 7.80847 2.36098 7.62551C2.56781 7.44254 2.8838 7.46189 3.06676 7.66872L6.23073 11.2454L12.9332 3.66872C13.1161 3.46189 13.4321 3.44254 13.6389 3.62551Z"
        fill={color}
      />
    </svg>
  )
})

export default Check03
