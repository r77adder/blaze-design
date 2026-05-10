import { forwardRef, useId } from 'react'
import { IconProps } from '../Types'

export const Plus02 = forwardRef<SVGSVGElement, IconProps>(({ color = 'currentColor', size = 20 }, forwardedRef) => {
  const filterId = useId()

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 22 25"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      ref={forwardedRef}
    >
      <defs>
        <filter
          id={filterId}
          x="-4"
          y="-1.5"
          width="30"
          height="30"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="3" />
          <feGaussianBlur stdDeviation="2.5" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.3 0" />
          <feBlend mode="normal" in2="BackgroundImageFix" result={`effect1_dropShadow_${filterId}`} />
          <feBlend mode="normal" in="SourceGraphic" in2={`effect1_dropShadow_${filterId}`} result="shape" />
        </filter>
      </defs>
      <g filter={`url(#${filterId})`}>
        <path
          d="M11 5.5L11 15.5M16 10.5L6 10.5"
          stroke={color}
          strokeOpacity="0.8"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </g>
    </svg>
  )
})

Plus02.displayName = 'Plus02'

export default Plus02
