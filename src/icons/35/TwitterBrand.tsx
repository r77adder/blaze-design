import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const TwitterBrand = forwardRef<SVGSVGElement, IconProps>(({ size = 35 }, forwardedRef) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size + 1}
      height={size}
      viewBox="0 0 36 35"
      style={{ width: size, height: size }}
      fill="none"
      ref={forwardedRef}
    >
      <rect x="0.666626" width="35" height="35" rx="5" fill="#15171A" />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M25.6378 6.78125L19.379 14.1098L14.3802 6.78125H7.44094L15.5213 18.6273L7.33008 28.2182H10.1528L16.7746 20.4646L22.0636 28.2182H29.0029L20.6325 15.9473L28.4604 6.78125H25.6378ZM23.3171 26.1365L18.1077 18.6306V18.6302L11.3714 8.92398H13.1115L25.0572 26.1365H23.3171Z"
        fill="white"
      />
    </svg>
  )
})

export default TwitterBrand
