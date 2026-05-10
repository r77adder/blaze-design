import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const Depop = forwardRef<SVGSVGElement, IconProps>(({ color = 'currentColor', size = 20 }, forwardedRef) => {
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
      <rect x="1" y="1" width="18" height="18" rx="9" fill="#FF2300" />
      <path
        d="M5.5 11.2678C5.5 9.55787 6.74476 8.50682 8.73515 8.50682H10.7959V6H13.375V13.875H8.72555C6.74473 13.875 5.5 12.8647 5.5 11.2678ZM8.22104 11.1831C8.22104 11.8388 8.62609 12.1808 9.40421 12.1808H10.782V10.1728H9.41701C8.6388 10.1728 8.22104 10.5179 8.22104 11.1831Z"
        fill="black"
      />
    </svg>
  )
})

export default Depop
