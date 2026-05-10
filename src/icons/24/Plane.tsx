import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const Plane = forwardRef<SVGSVGElement, IconProps>(({ color = 'currentColor', size = 24 }, forwardedRef) => {
  return (
    <svg
      width={size}
      height={size}
      style={{ width: size, height: size }}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      ref={forwardedRef}
    >
      <path
        d="M2.8775 16.2217L6.69434 18.1302L8.60277 21.947L10.5112 20.0386V17.176L13.8509 13.8362L16.7136 22.4241L19.5762 19.5615L17.1907 10.4965L21.0075 6.67963C21.798 5.88913 21.798 4.60749 21.0075 3.81699C20.217 3.0265 18.9354 3.0265 18.1449 3.81699L14.328 7.63384L5.26303 5.24831L2.40039 8.11094L10.9883 10.9736L7.64855 14.3133H4.78592L2.8775 16.2217Z"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
})

export default Plane
