import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const Twitter = forwardRef<SVGSVGElement, IconProps>(({ color, size = 16 }, forwardedRef) => {
  if (color) {
    return (
      <svg width={size} height={size} viewBox="0 0 15 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect y="0.5" width="15" height="15" rx="4" fill="#15171A" />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M10.7016 3.40625L8.0193 6.54705L5.87694 3.40625H2.90298L6.36601 8.48314L2.85547 12.5935H4.06522L6.90312 9.27053L9.16984 12.5935H12.1438L8.5565 7.33456L11.9113 3.40625H10.7016ZM9.70704 11.7013L7.47446 8.48456V8.48438L4.58746 4.32456H5.33323L10.4528 11.7013H9.70704Z"
          fill="white"
        />
      </svg>
    )
  }

  return (
    <svg
      width={size}
      height={size}
      style={{ width: size, height: size }}
      viewBox="0 0 15 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      ref={forwardedRef}
    >
      <rect y="0.5" width="15" height="15" rx="4" fill="#15171A" />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M10.7016 3.40625L8.0193 6.54705L5.87694 3.40625H2.90298L6.36601 8.48314L2.85547 12.5935H4.06522L6.90312 9.27053L9.16984 12.5935H12.1438L8.5565 7.33456L11.9113 3.40625H10.7016ZM9.70704 11.7013L7.47446 8.48456V8.48438L4.58746 4.32456H5.33323L10.4528 11.7013H9.70704Z"
        fill="white"
      />
    </svg>
  )
})

export default Twitter
