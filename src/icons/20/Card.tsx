import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const Card = forwardRef<SVGSVGElement, IconProps>(({ color = 'currentColor', size = 20 }, forwardedRef) => {
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
        d="M2.49966 7.74989H17.4997M4.00005 4.25001H15.9997C17.1043 4.25001 17.9997 5.14474 17.9997 6.24928L18 13.7509C18 14.8554 17.1045 15.75 16 15.75L4.00024 15.7499C2.8957 15.7499 2.00029 14.8545 2.00026 13.7499L2.00005 6.25007C2.00002 5.14547 2.89546 4.25001 4.00005 4.25001Z"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
})

export default Card
