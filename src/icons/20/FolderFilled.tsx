import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const FolderFilled = forwardRef<SVGSVGElement, IconProps>(
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
          d="M1.49164 6.82379L1.49155 15.0388C1.49154 16.1434 2.38697 17.0388 3.49155 17.0388L16.5091 17.0389C17.6137 17.0389 18.5091 16.1435 18.5091 15.0389L18.5094 7.07912C18.5094 6.25067 17.8378 5.57907 17.0094 5.57907H10.9416C10.3882 5.57907 9.85965 5.34984 9.48151 4.9459L8.21609 3.59417C7.83795 3.19023 7.30935 2.961 6.75603 2.961H2.99129C2.16264 2.961 1.49097 3.63249 1.49121 4.46113C1.49143 5.23139 1.49164 6.14741 1.49164 6.82379Z"
          fill={color}
          fillOpacity="0.8"
        />
      </svg>
    )
  },
)

export default FolderFilled
