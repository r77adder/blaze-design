import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const Templates = forwardRef<SVGSVGElement, IconProps>(({ color = 'currentColor', size = 20 }, forwardedRef) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      ref={forwardedRef}
    >
      <path d="M12.126 16.906V11.8452H17.1869V16.906H12.126Z" stroke={color} fill="white" strokeWidth="1.5" />
      <path
        d="M2.49683 5.26108C2.49683 3.58482 3.8557 2.22595 5.53195 2.22595C7.2082 2.22595 8.56707 3.58482 8.56707 5.26108C8.56707 6.93733 7.2082 8.2962 5.53195 8.2962C3.8557 8.2962 2.49683 6.93733 2.49683 5.26108Z"
        stroke={color}
        fill="white"
        strokeWidth="1.5"
      />
      <path
        d="M7.08637 12.7805L7.09165 12.7859L7.09703 12.7912L8.75058 14.4118L7.09703 16.0324L7.09165 16.0377L7.08637 16.0431L5.46574 17.6966L3.8451 16.0431L3.83982 16.0377L3.83444 16.0324L2.1809 14.4118L3.83444 12.7912L3.83982 12.7859L3.8451 12.7805L5.46574 11.127L7.08637 12.7805Z"
        stroke={color}
        fill="white"
        strokeWidth="1.5"
      />
      <path
        d="M11.6137 8.04376L14.6165 2.74477L17.6192 8.04376H11.6137Z"
        stroke={color}
        fill="white"
        strokeWidth="1.5"
      />
    </svg>
  )
})

export default Templates
