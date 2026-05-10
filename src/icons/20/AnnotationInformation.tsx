import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const AnnotationInformation = forwardRef<SVGSVGElement, IconProps>(
  ({ color = 'currentColor', size = 20 }, forwardedRef) => {
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
          d="M10 10.9375V8.125M10 5.3125V5.383M12.038 13.587L10 17.5L8.125 13.587H4.375C3.33947 13.587 2.5 12.7475 2.5 11.712V4.375C2.5 3.33947 3.33947 2.5 4.375 2.5H15.625C16.6605 2.5 17.5 3.33947 17.5 4.375V11.712C17.5 12.7475 16.6605 13.587 15.625 13.587H12.038Z"
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

export default AnnotationInformation
