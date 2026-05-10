import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const VideoOn = forwardRef<SVGSVGElement, IconProps>(({ color = 'currentColor', size = 20 }, forwardedRef) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 21 20" fill="none">
      <path
        d="M10.3877 7.36103H8.09606M13.5292 11.9888L17.4041 13.8975C17.8058 14.142 18.2273 13.9979 18.2165 13.488L18.1893 6.74245C18.155 6.18881 17.8283 6.03774 17.3472 6.2936L13.5183 8.03373M4.6748 15.4166H11.6377C12.6733 15.4166 13.5127 14.5875 13.5127 13.5647L13.5292 11.1895L13.5127 6.4351C13.5127 5.41235 12.6733 4.58325 11.6377 4.58325H4.6748C3.63927 4.58325 2.7998 5.41235 2.7998 6.4351V13.5647C2.7998 14.5875 3.63927 15.4166 4.6748 15.4166Z"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
})

export default VideoOn
