import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const ImageX = forwardRef<SVGSVGElement, IconProps>(({ color = 'currentColor', size = 20 }, forwardedRef) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      ref={forwardedRef}
    >
      <path
        d="M4.63136 18.3832L12.4664 11.2738L16.9628 14.583V15.4443C16.9628 17.0674 15.6887 18.3832 14.1171 18.3832H4.63136ZM4.63136 18.3832C3.05972 18.3832 1.78564 17.0674 1.78564 15.4443V5.64811C1.78564 4.02502 3.05972 2.70924 4.63136 2.70924H7.65992M12.4884 7.5L15.2184 4.77002M15.2184 4.77002L17.9483 2.04013M15.2184 4.77002L12.4932 2.0448M15.2184 4.77002L17.7799 7.33165M8.45 7.72467C8.45 8.67717 7.67769 9.44933 6.725 9.44933C5.77231 9.44933 5 8.67717 5 7.72467C5 6.77216 5.77231 6 6.725 6C7.67769 6 8.45 6.77216 8.45 7.72467Z"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
})

export default ImageX
