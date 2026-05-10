import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const Help = forwardRef<SVGSVGElement, IconProps>(({ color = 'currentColor', size = 20 }, forwardedRef) => {
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
        d="M9.99823 16.5156V17.5156M5.83337 6.57438C5.83337 4.33279 7.69886 2.51562 10 2.51562C12.3012 2.51562 14.1667 4.33279 14.1667 6.57438C14.1667 8.14 13.2567 9.49858 11.9238 10.1756C10.9405 10.675 9.99844 11.5255 9.99826 12.6283C9.99824 12.7262 9.99823 12.8276 9.99823 12.9323"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
})

export default Help
