import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const Feather = forwardRef<SVGSVGElement, IconProps>(({ color = 'currentColor', size = 30 }, forwardedRef) => {
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
        d="M6.46903 23.9102L19.197 11.1822M14.0452 16.9401L20.7122 16.9401M17.0756 21.1827L23.4396 14.8188C25.6154 12.643 25.6154 9.11537 23.4396 6.93959C21.2638 4.76382 17.7362 4.76382 15.5604 6.93959L9.19644 13.3036L9.19644 21.1827L17.0756 21.1827Z"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
})

export default Feather
