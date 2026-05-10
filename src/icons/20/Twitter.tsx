import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const Twitter = forwardRef<SVGSVGElement, IconProps>(({ color, size = 20 }, forwardedRef) => {
  if (color) {
    return (
      <svg width={size} height={size} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M14.731 3.23382L10.5497 8.12987L7.21004 3.23382H2.57405L7.97241 11.148L2.49999 17.5555H4.38582L8.80969 12.3754L12.3432 17.5555H16.9792L11.3871 9.35748L16.6168 3.23382H14.731ZM13.1806 16.1647L9.70033 11.1502V11.1499L5.19991 4.66534H6.36246L14.3432 16.1647H13.1806Z"
          fill={color}
        />
      </svg>
    )
  }

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
        fillRule="evenodd"
        clipRule="evenodd"
        d="M14.731 3.23382L10.5497 8.12987L7.21004 3.23382H2.57405L7.97241 11.148L2.49999 17.5555H4.38582L8.80969 12.3754L12.3432 17.5555H16.9792L11.3871 9.35748L16.6168 3.23382H14.731ZM13.1806 16.1647L9.70033 11.1502V11.1499L5.19991 4.66534H6.36246L14.3432 16.1647H13.1806Z"
        fill="#15171A"
      />
    </svg>
  )
})

export default Twitter
