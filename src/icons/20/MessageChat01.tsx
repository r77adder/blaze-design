import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const MessageChat01 = forwardRef<SVGSVGElement, IconProps>(
  ({ color = 'currentColor', size = 20 }, forwardedRef) => {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 28 28"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        ref={forwardedRef}
      >
        <path
          d="M22.1667 12.25V6.99996C22.1667 5.7113 21.122 4.66663 19.8333 4.66663H5.83333C4.54467 4.66663 3.5 5.7113 3.5 6.99996V16.1304C3.5 17.4191 4.54467 18.4637 5.83333 18.4637H7.65942V23.3333L12.529 18.4637H12.8333M18.8569 21.4565L21.9004 24.5V21.4565H22.1667C23.4553 21.4565 24.5 20.4118 24.5 19.1231V15.1666C24.5 13.878 23.4553 12.8333 22.1667 12.8333H15.1667C13.878 12.8333 12.8333 13.878 12.8333 15.1666V19.1232C12.8333 20.4118 13.878 21.4565 15.1667 21.4565H18.8569Z"
          stroke={color}
          strokeWidth="1.15"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
  },
)

export default MessageChat01
