import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const AddMember = forwardRef<SVGSVGElement, IconProps>(({ color = 'currentColor', size = 16 }, forwardedRef) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      ref={forwardedRef}
    >
      <path
        d="M1.59998 14.9L1.60025 12.4997C1.60039 11.1743 2.67487 10.1 4.00024 10.1H5.83337M9.59997 4.49998C9.59997 5.82546 8.52546 6.89997 7.19997 6.89997C5.87449 6.89997 4.79997 5.82546 4.79997 4.49998C4.79997 3.17449 5.87449 2.09998 7.19997 2.09998C8.52546 2.09998 9.59997 3.17449 9.59997 4.49998Z"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M15.3333 10.1668H12.3333M12.3333 10.1668H9.33331M12.3333 10.1668V13.1667M12.3333 10.1668V7.16669"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  )
})

export default AddMember
