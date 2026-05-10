import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const MoreDots = forwardRef<SVGSVGElement, IconProps>(({ color = 'currentColor', size = 20 }, forwardedRef) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      ref={forwardedRef}
    >
      <path
        d="M5.83324 9.99988C5.83324 10.6902 5.2736 11.2499 4.58324 11.2499C3.89289 11.2499 3.33324 10.6902 3.33324 9.99988C3.33324 9.30953 3.89289 8.74988 4.58324 8.74988C5.2736 8.74988 5.83324 9.30953 5.83324 9.99988Z"
        fill={color}
      />
      <path
        d="M11.25 10.0001C11.25 10.6905 10.6903 11.2501 9.99996 11.2501C9.30961 11.2501 8.74996 10.6905 8.74996 10.0001C8.74996 9.30974 9.30961 8.7501 9.99996 8.7501C10.6903 8.7501 11.25 9.30974 11.25 10.0001Z"
        fill={color}
      />
      <path
        d="M16.6666 10.0483C16.6666 10.7386 16.1069 11.2983 15.4166 11.2983C14.7262 11.2983 14.1666 10.7386 14.1666 10.0483C14.1666 9.35791 14.7262 8.79826 15.4166 8.79826C16.1069 8.79826 16.6666 9.35791 16.6666 10.0483Z"
        fill={color}
      />
    </svg>
  )
})

export default MoreDots
