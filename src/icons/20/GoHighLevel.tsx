import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const GoHighLevel = forwardRef<SVGSVGElement, IconProps>(
  ({ color = 'currentColor', size = 20, ...rest }, forwardedRef) => {
    return (
      <svg
        width={size}
        height={size}
        style={{ width: size, height: size }}
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        ref={forwardedRef}
        {...rest}
      >
        <rect width="20" height="20" fill="#08223D" />
        <rect x="5.41064" y="6.5" width="1.71429" height="9.89286" fill="#FEC401" />
        <rect x="12.8569" y="6.5" width="1.71429" height="9.89286" fill="#4ACF28" />
        <rect x="9" y="10.625" width="1.89286" height="5.76786" fill="#2996FB" />
        <path d="M9.0535 6.51786H3.53564L6.28564 3.60715L9.0535 6.51786Z" fill="#FEC401" />
        <path d="M12.8125 10.625H7.1875L9.9909 7.65776L12.8125 10.625Z" fill="#2996FB" />
        <path d="M16.4998 6.51786H10.9819L13.7319 3.60715L16.4998 6.51786Z" fill="#4ACF28" />
        <path d="M14.5757 8.1875L12.8569 6.51786L14.5757 6.51785L14.5757 8.1875Z" fill="#52B447" />
        <path d="M10.919 12.4888L8.98821 10.6131L10.919 10.6131V12.4888Z" fill="#1F81DC" />
        <path d="M7.12939 8.1875L5.41064 6.51786L7.12939 6.51785L7.12939 8.1875Z" fill="#DAAA00" />
      </svg>
    )
  },
)

export default GoHighLevel
