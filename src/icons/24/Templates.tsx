import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const Templates = forwardRef<SVGSVGElement, IconProps>(({ color = 'currentColor', size = 24 }, forwardedRef) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      ref={forwardedRef}
    >
      <path d="M20.7742 14.0454V20.4185H14.4011V14.0454H20.7742Z" stroke={color} strokeWidth="1.5" />
      <path
        d="M6.63824 2.50244C8.73254 2.50244 10.4302 4.20016 10.4302 6.29443C10.4302 8.38878 8.73259 10.0864 6.63824 10.0864C4.54397 10.0863 2.84625 8.38873 2.84625 6.29443C2.84634 4.20021 4.54402 2.50253 6.63824 2.50244Z"
        stroke={color}
        strokeWidth="1.5"
      />
      <path
        d="M8.61047 15.2129L8.62122 15.2236L10.714 17.2754L8.62122 19.3271L8.61633 19.333L8.61047 19.3379L6.55872 21.4307L4.50696 19.3379L4.49622 19.3271L2.40247 17.2754L4.49622 15.2236L4.50208 15.2188L4.50696 15.2129L6.55872 13.1191L8.61047 15.2129Z"
        stroke={color}
        strokeWidth="1.5"
      />
      <path d="M21.3998 9.7832H13.6791L17.5394 2.96973L21.3998 9.7832Z" stroke={color} strokeWidth="1.5" />
    </svg>
  )
})

export default Templates
