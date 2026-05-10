import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const LinkedIn = forwardRef<SVGSVGElement, IconProps>(({ color, size = 16 }, forwardedRef) => {
  if (color) {
    return (
      <svg width={size} height={size} viewBox="0 0 15 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Background rounded rectangle */}
        <rect x="1.35938" y="1.85938" width="12.2812" height="12.2812" rx="2.55859" fill="#1275B1" />
        {/* White letters and icons */}
        <path
          d="M5.45312 11.582H3.91797V5.95312H5.45312V11.582ZM4.68555 5.30427C4.19123 5.30427 3.79004 4.90001 3.79004 4.40159C3.79004 3.90318 4.19123 3.49892 4.68555 3.49892C5.17987 3.49892 5.58105 3.90318 5.58105 4.40159C5.58105 4.90001 5.18038 5.30427 4.68555 5.30427ZM11.5938 11.582H10.0586V8.71436C10.0586 6.99089 8.01172 7.12138 8.01172 8.71436V11.582H6.47656V5.95312H8.01172V6.85631C8.72608 5.533 11.5938 5.43527 11.5938 8.12332V11.582Z"
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
      {/* Background rounded rectangle */}
      <rect x="1.35938" y="1.85938" width="12.2812" height="12.2812" rx="2.55859" fill="#1275B1" />
      {/* White letters and icons */}
      <path
        d="M5.45312 11.582H3.91797V5.95312H5.45312V11.582ZM4.68555 5.30427C4.19123 5.30427 3.79004 4.90001 3.79004 4.40159C3.79004 3.90318 4.19123 3.49892 4.68555 3.49892C5.17987 3.49892 5.58105 3.90318 5.58105 4.40159C5.58105 4.90001 5.18038 5.30427 4.68555 5.30427ZM11.5938 11.582H10.0586V8.71436C10.0586 6.99089 8.01172 7.12138 8.01172 8.71436V11.582H6.47656V5.95312H8.01172V6.85631C8.72608 5.533 11.5938 5.43527 11.5938 8.12332V11.582Z"
        fill="white"
      />
    </svg>
  )
})

export default LinkedIn
