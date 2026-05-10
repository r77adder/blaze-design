import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const Video = forwardRef<SVGSVGElement, IconProps>(({ color = 'currentColor', size = 20 }, forwardedRef) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      ref={forwardedRef}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M2.5 6.43535C2.5 5.4126 3.33947 4.5835 4.375 4.5835H11.3379C12.3735 4.5835 13.2129 5.4126 13.2129 6.43535L13.2294 11.1898L13.2129 13.565C13.2129 14.5877 12.3735 15.4168 11.3379 15.4168H4.375C3.33947 15.4168 2.5 14.5877 2.5 13.565V6.43535ZM10 6.72488C10 6.17259 10.4477 5.72488 11 5.72488C11.5523 5.72488 12 6.17259 12 6.72488C12 7.27716 11.5523 7.72488 11 7.72488C10.4477 7.72488 10 7.27716 10 6.72488ZM14.0567 8.43007V11.6961C14.0567 11.8824 14.1602 12.0532 14.3254 12.1394L17.103 13.5889C17.4359 13.7627 17.8343 13.5211 17.8343 13.1457V7.10841C17.8343 6.74098 17.4513 6.49905 17.1195 6.65692L14.3419 7.97858C14.1677 8.06147 14.0567 8.23717 14.0567 8.43007Z"
        fill="url(#paint0_linear_2721_29299)"
      />
      <defs>
        <linearGradient
          id="paint0_linear_2721_29299"
          x1="10.1672"
          y1="4.5835"
          x2="10.1672"
          y2="15.4168"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#4F62F8" />
          <stop offset="1" stopColor="#0019DF" />
        </linearGradient>
      </defs>
    </svg>
  )
})

export default Video
