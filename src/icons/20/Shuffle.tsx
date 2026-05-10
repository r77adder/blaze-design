import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const Shuffle = forwardRef<SVGSVGElement, IconProps>(({ color = 'currentColor', size = 20 }, forwardedRef) => {
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
        d="M2.5 15.2771H3.98928C4.89758 15.2771 5.74996 14.8384 6.2779 14.0993L7.07749 12.9799M16.9186 5.39313H13.75C12.8417 5.39313 11.9893 5.83178 11.4614 6.57089L10.5666 7.82359M14.5833 2.47653L17.5 5.39313L14.5833 8.30979M14.5833 12.4069L17.5 15.3235L14.5833 18.2402M2.5 5.71113H3.98928C4.89758 5.71113 5.74996 6.14979 6.2779 6.8889L11.4614 14.1458C11.9893 14.8849 12.8417 15.3235 13.75 15.3235H16.9186"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
})

export default Shuffle
