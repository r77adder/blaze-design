import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const Service = forwardRef<SVGSVGElement, IconProps>(({ color = 'currentColor', size = 20 }, forwardedRef) => {
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
        d="M10 10.75V7.01206M10 13.5206V13.5535M14.7249 16.6667H5.27506C3.98425 16.6667 2.89494 15.8136 2.55221 14.6464C2.40591 14.1482 2.58567 13.6293 2.86063 13.1874L7.58557 4.66752C8.69258 2.8886 11.3074 2.88861 12.4144 4.66752L17.1394 13.1874C17.4143 13.6293 17.5941 14.1482 17.4478 14.6464C17.1051 15.8136 16.0157 16.6667 14.7249 16.6667Z"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
})

export default Service
