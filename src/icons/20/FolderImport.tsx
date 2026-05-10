import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const FolderImport = forwardRef<SVGSVGElement, IconProps>(
  ({ color = 'currentColor', size = 20 }, forwardedRef) => {
    return (
      <svg
        width={size}
        height={size}
        style={{ width: size, height: size }}
        viewBox="0 0 20 15"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        ref={forwardedRef}
      >
        <path
          d="M2.72695 4.7124V1.74283C2.72678 1.19456 3.1712 0.75 3.71948 0.75H9.68266L12.528 3.193L16.6845 3.193C17.2327 3.193 17.6771 3.63739 17.677 4.18556L17.6768 12.5292C17.6768 13.6255 16.788 14.5142 15.6917 14.5142L4.71247 14.5141C3.61615 14.5141 2.72741 13.6254 2.72741 12.5291V11.9162M0.75 8.3452H10.8021M7.46404 11.6832L10.8021 8.3452M10.8021 8.3452L7.46404 5.00716"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
  },
)

export default FolderImport
