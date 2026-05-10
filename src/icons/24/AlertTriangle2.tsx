import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const AlertTriangle2 = forwardRef<SVGSVGElement, IconProps>(
  ({ color = 'currentColor', size = 24 }, forwardedRef) => {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        style={{ width: size, height: size }}
        viewBox="0 0 24 24"
        fill="none"
        ref={forwardedRef}
      >
        <path
          d="M11.1455 2.49316C11.5252 1.83584 12.4737 1.83594 12.8535 2.49316L22.252 18.7705C22.6312 19.428 22.1565 20.2498 21.3975 20.25H2.60254C1.84318 20.25 1.36844 19.4281 1.74805 18.7705L11.1455 2.49316ZM11.0684 15.832V17.835H13.0703V15.832H11.0684ZM11.0127 7.41113L11.4414 14.3301H12.6846L13.1123 7.41113H11.0127Z"
          fill={color}
        />
      </svg>
    )
  },
)

export default AlertTriangle2
