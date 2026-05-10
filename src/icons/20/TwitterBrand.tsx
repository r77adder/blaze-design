import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const TwitterBrand = forwardRef<SVGSVGElement, IconProps>(({ size = 20, color, ...rest }, forwardedRef) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      ref={forwardedRef}
      {...rest}
    >
      <rect width="20" height="20" rx="5" fill="#15171A" />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M14.2701 3.875L10.6937 8.06273L7.83723 3.875H3.87194L8.48931 10.6442L3.80859 16.1247H5.4216L9.20546 11.694L12.2277 16.1247H16.193L11.41 9.11274L15.8831 3.875H14.2701ZM12.944 14.9351L9.96725 10.6461V10.6458L6.11791 5.09942H7.11227L13.9384 14.9351H12.944Z"
        fill="white"
      />
    </svg>
  )
})

export default TwitterBrand
