import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const Edit1 = forwardRef<SVGSVGElement, IconProps>(({ color = 'currentColor', size = 20 }, forwardedRef) => {
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
        d="M10.4471 16.036L11.0657 15.3427C11.8246 14.4921 13.1863 14.6026 13.7981 15.5646C14.3681 16.4606 15.6062 16.6305 16.3964 15.921L17.5176 14.9144M2.48242 16.2252L6.12074 15.4921C6.31389 15.4531 6.49124 15.358 6.63052 15.2187L14.7752 7.06947C15.1657 6.67876 15.1655 6.04543 14.7747 5.65505L13.0493 3.93165C12.6586 3.54143 12.0256 3.5417 11.6353 3.93225L3.48972 12.0823C3.35071 12.2214 3.25579 12.3984 3.21684 12.5911L2.48242 16.2252Z"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
})

export default Edit1
