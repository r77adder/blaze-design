import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const Video = forwardRef<SVGSVGElement, IconProps>(({ color = 'currentColor', size = 24 }, forwardedRef) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 25 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      ref={forwardedRef}
    >
      <g id="video-on">
        <path
          id="Icon"
          d="M12.7057 8.83333H9.95566M16.4754 14.3867L21.1253 16.6771C21.6073 16.9705 22.1132 16.7976 22.1002 16.1856L22.0676 8.09104C22.0264 7.42667 21.6343 7.24539 21.057 7.55242L16.4623 9.64057M5.85016 18.5H14.2057C15.4483 18.5 16.4557 17.5051 16.4557 16.2778L16.4754 13.4275L16.4557 7.72222C16.4557 6.49492 15.4483 5.5 14.2057 5.5H5.85016C4.60752 5.5 3.60016 6.49492 3.60016 7.72222V16.2778C3.60016 17.5051 4.60752 18.5 5.85016 18.5Z"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  )
})

export default Video
