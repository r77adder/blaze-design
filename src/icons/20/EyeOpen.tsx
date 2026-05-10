import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const EyeOpen = forwardRef<SVGSVGElement, IconProps>(({ color = 'currentColor', size = 20 }, forwardedRef) => {
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
        d="M10 15.7129C16.1026 15.8127 18 10.0991 18 10.0991C18 10.0991 16.1795 4.28564 10 4.28564C3.82051 4.28564 2 10.0991 2 10.0991C2 10.0991 3.89744 15.6131 10 15.7129Z"
        stroke={color}
        strokeWidth="1.5"
      />
      <path
        d="M12 10.0243C12 11.0991 11.1046 11.9704 10 11.9704C8.89543 11.9704 8 11.0991 8 10.0243C8 8.94944 8.89543 8.07812 10 8.07812C11.1046 8.07812 12 8.94944 12 10.0243Z"
        stroke={color}
        strokeWidth="1.5"
      />
    </svg>
  )
})

export default EyeOpen
