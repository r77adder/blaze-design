import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const ArrangeBackward = forwardRef<SVGSVGElement, IconProps>(
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
          fillRule="evenodd"
          clipRule="evenodd"
          d="M6.14252 13.7945C5.85366 13.4977 5.86017 13.0228 6.15704 12.734C6.45392 12.4451 6.92875 12.4516 7.2176 12.7485L9.25001 14.8373L9.25 7.1296C9.25 6.71539 9.58579 6.3796 10 6.3796C10.4142 6.3796 10.75 6.71539 10.75 7.1296L10.75 14.8373L12.7824 12.7485C13.0713 12.4516 13.5461 12.4451 13.843 12.734C14.1399 13.0228 14.1464 13.4977 13.8575 13.7945L10.5375 17.2067C10.3964 17.3518 10.2025 17.4337 10 17.4337C9.79753 17.4337 9.60366 17.3518 9.46246 17.2067L6.14252 13.7945ZM2.3698 8.24763L7.9527 11.0391V9.36203L3.48784 7.1296L9.88819 3.92942C9.95858 3.89423 10.0414 3.89423 10.1118 3.92942L16.5122 7.1296L12.0473 9.36203V11.0391L17.6302 8.24763C18.5515 7.78698 18.5515 6.47222 17.6302 6.01156L10.7826 2.58778C10.2899 2.34144 9.71005 2.34144 9.21737 2.58778L2.3698 6.01156C1.4485 6.47222 1.44849 7.78697 2.3698 8.24763Z"
          fill={color}
        />
      </svg>
    )
  },
)

export default ArrangeBackward
