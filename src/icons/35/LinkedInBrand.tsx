import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const LinkedInBrand = forwardRef<SVGSVGElement, IconProps>(({ size = 35 }, forwardedRef) => {
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
      <rect x="0.666626" width="35" height="35" rx="5" fill="#1275B1" />
      <path d="M8.49742 27.1305H12.653V11.8934H8.49742V27.1305Z" fill="white" />
      <path
        d="M8.15112 7.69348C8.15112 9.04265 9.23711 10.137 10.5752 10.137C11.9147 10.137 12.9993 9.04265 12.9993 7.69348C12.9993 6.3443 11.9133 5.25 10.5752 5.25C9.23711 5.25 8.15112 6.3443 8.15112 7.69348Z"
        fill="white"
      />
      <path
        d="M25.1197 27.1305H29.2753V17.768C29.2753 10.4916 21.5127 10.7561 19.579 14.3382V11.8934H15.4234V27.1305H19.579V19.3679C19.579 15.0558 25.1197 14.7025 25.1197 19.3679V27.1305Z"
        fill="white"
      />
    </svg>
  )
})

export default LinkedInBrand
