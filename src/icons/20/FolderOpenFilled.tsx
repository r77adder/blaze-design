import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const FolderOpenFilled = forwardRef<SVGSVGElement, IconProps>(
  ({ color = 'currentColor', size = 20 }, forwardedRef) => {
    return (
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        ref={forwardedRef}
      >
        <path
          d="M2 15V4.13889C2 3.64797 2.39797 3.25 2.88889 3.25H7.37213C7.67392 3.25 7.9551 3.40313 8.11883 3.65664L9.47712 5.7598H15.3333C15.8243 5.7598 16.2222 6.15777 16.2222 6.64869V8.75H17.1111C17.602 8.75 18 9.14797 18 9.63889V14.8317C18 15.8911 17.1411 16.75 16.0817 16.75H3.75C2.7835 16.75 2 15.9665 2 15Z"
          fill="white"
        />
        <path
          d="M13.7647 8.75H17.1111C17.602 8.75 18 9.14797 18 9.63889V14.8317V14.8317C18 15.8911 17.1411 16.75 16.0817 16.75H3.75M2 4.13889V15C2 15.9665 2.7835 16.75 3.75 16.75V16.75C4.7165 16.75 5.5 15.9665 5.5 15V14.5834V9.63889C5.5 9.14797 5.89797 8.75 6.38889 8.75H16.2222V6.64869C16.2222 6.15777 15.8243 5.7598 15.3333 5.7598H9.47712L8.11883 3.65664C7.9551 3.40313 7.67392 3.25 7.37213 3.25H2.88889C2.39797 3.25 2 3.64797 2 4.13889Z"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
  },
)

export default FolderOpenFilled
