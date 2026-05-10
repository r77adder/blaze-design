import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const Marker2 = forwardRef<SVGSVGElement, IconProps>(({ color = 'currentColor', size = 20 }, forwardedRef) => (
  <svg width={size} height={size} viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" ref={forwardedRef}>
    <path
      d="M13.9996 25.2C13.9996 25.2 22.7648 17.4087 22.7648 11.5653C22.7648 6.72437 18.8405 2.80005 13.9996 2.80005C9.1587 2.80005 5.23438 6.72437 5.23438 11.5653C5.23438 17.4087 13.9996 25.2 13.9996 25.2Z"
      stroke={color}
      strokeWidth="1.15"
    />
    <path
      d="M16.8 11.2002C16.8 12.7466 15.5463 14.0002 14 14.0002C12.4536 14.0002 11.2 12.7466 11.2 11.2002C11.2 9.65383 12.4536 8.40023 14 8.40023C15.5463 8.40023 16.8 9.65383 16.8 11.2002Z"
      stroke={color}
      strokeWidth="1.15"
    />
  </svg>
))

export default Marker2
