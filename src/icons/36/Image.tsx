import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const Image = forwardRef<SVGSVGElement, IconProps>(({ size = 36 }, forwardedRef) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      ref={forwardedRef}
    >
      <mask id="path-1-inside-1_4_164" fill="white">
        <path d="M0 0H36V36H0V0Z" />
      </mask>
      <path d="M0 0H36V36H0V0Z" fill="white" />
      <path d="M0 0H36V36H0V0Z" fill="url(#paint0_angular_4_164)" fillOpacity="0.79" />
      <path
        d="M0 0V-1.5C-0.828427 -1.5 -1.5 -0.828427 -1.5 0L0 0ZM36 0H37.5C37.5 -0.828427 36.8284 -1.5 36 -1.5V0ZM36 36V37.5C36.8284 37.5 37.5 36.8284 37.5 36H36ZM0 36H-1.5C-1.5 36.8284 -0.828427 37.5 0 37.5L0 36ZM0 1.5H36V-1.5H0V1.5ZM34.5 0V36H37.5V0H34.5ZM36 34.5H0V37.5H36V34.5ZM1.5 36V0H-1.5V36H1.5Z"
        fill="white"
        mask="url(#path-1-inside-1_4_164)"
      />
      <defs>
        <radialGradient
          id="paint0_angular_4_164"
          cx="0"
          cy="0"
          r="1"
          gradientUnits="userSpaceOnUse"
          gradientTransform="translate(1.8 34.2) rotate(-45) scale(45.8205 39.5387)"
        >
          <stop offset="5.49738e-05" stopColor="#2B99FE" />
          <stop offset="0.000125326" stopColor="#F56700" />
          <stop offset="0.11057" stopColor="#FBE620" stopOpacity="0.82" />
          <stop offset="0.837209" stopColor="#25FB20" stopOpacity="0.82" />
        </radialGradient>
      </defs>
    </svg>
  )
})

export default Image
