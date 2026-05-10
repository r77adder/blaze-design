import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const ProIcon = forwardRef<SVGSVGElement, IconProps>(({ color = 'currentColor', size = 20 }, forwardedRef) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 21 21"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      ref={forwardedRef}
    >
      <path
        d="M18.0413 18.9607V10.7519C18.0413 10.3972 17.8524 10.0715 17.5556 9.87733C15.1644 8.3132 11.5648 4.91127 10.3742 2.001C10.2952 1.80789 9.95279 1.8126 9.87903 2.00777C8.78045 4.91443 5.37024 8.25896 2.89863 9.87787C2.60282 10.0716 2.41534 10.3964 2.41534 10.75V18.9607"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M2.41534 13.2109C4.74423 11.8361 8.29943 9.39854 9.95411 6.84723C10.0376 6.71843 10.2307 6.71927 10.3134 6.8486C11.8951 9.3218 15.5435 11.8762 18.0413 13.2109"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M2.41534 16.1459C5.21859 14.7496 7.82547 13.364 9.99141 10.966C10.0694 10.8796 10.2044 10.8757 10.2868 10.9578C12.5974 13.2614 15.6319 15.021 18.0413 16.1459"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M2.41534 18.961C5.12173 17.9771 7.3998 16.8436 9.98819 14.6931C10.0624 14.6314 10.1706 14.6307 10.2454 14.6915C12.7569 16.7301 15.3377 17.9778 18.0413 18.961"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  )
})

export default ProIcon
