import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const FileCheck02 = forwardRef<SVGSVGElement, IconProps>(
  ({ color = 'currentColor', size = 16 }, forwardedRef) => {
    return (
      <svg width={size} height={size} viewBox="0 0 16 17" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M6.86653 14.5558H3.66652C2.78286 14.5558 2.06652 13.8395 2.06653 12.9558L2.06659 3.35585C2.0666 2.4722 2.78294 1.75586 3.66659 1.75586H10.8668C11.7504 1.75586 12.4668 2.4722 12.4668 3.35586V7.75586M9.26678 12.2892L10.7334 13.7559L13.9334 10.5557M4.86678 4.95586H9.66678M4.86678 7.35586H9.66678M4.86678 9.75586H7.26678"
          stroke={color}
          strokeOpacity="0.8"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
  },
)

export default FileCheck02
