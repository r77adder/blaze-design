import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const Calendar1 = forwardRef<SVGSVGElement, IconProps>(({ color = 'currentColor', size = 36 }, forwardedRef) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 36 36" fill="none">
      <path
        d="M7.125 13.3714H28.125M9.83929 4.5V6.81456M25.125 4.5V6.81427M29.625 10.8643V27.45C29.625 29.6868 27.8341 31.5 25.625 31.5H9.625C7.41586 31.5 5.625 29.6868 5.625 27.45V10.8643C5.625 8.62752 7.41586 6.81427 9.625 6.81427H25.625C27.8341 6.81427 29.625 8.62752 29.625 10.8643Z"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
})

export default Calendar1
