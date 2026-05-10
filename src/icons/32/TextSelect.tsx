import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const TextSelect = forwardRef<SVGSVGElement, IconProps>(
  ({ color = 'currentColor', size = 32 }, forwardedRef) => {
    return (
      <svg
        width={size}
        height={size}
        style={{ width: size, height: size }}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        ref={forwardedRef}
      >
        <path
          d="M3.20001 6.59998C3.20001 6.04769 3.64773 5.59998 4.20001 5.59998H20.5378C21.5871 5.59998 22.4579 6.41087 22.5327 7.45748L23.1894 16.652C23.1965 16.7505 23.1962 16.8494 23.1886 16.9479L22.5421 25.3534C22.4619 26.3954 21.593 27.2 20.548 27.2H4.20001C3.64773 27.2 3.20001 26.7523 3.20001 26.2V6.59998Z"
          fill={color}
          fillOpacity="0.2"
        />
        <path
          d="M23.0865 9.03456C23.3441 8.43144 24.2235 7.50263 24.7944 7.19503C25.3344 6.90191 25.8898 6.65222 26.4206 6.52074C27.0701 6.3579 28.4386 6.40735 28.4386 6.40735"
          stroke={color}
          strokeWidth="1.129"
          strokeLinecap="round"
        />
        <path
          d="M22.9521 9.00157C22.7132 8.36887 21.7277 7.39873 21.2889 7.1348C20.7641 6.82147 20.1816 6.619 19.6443 6.48764C18.9853 6.32495 17.6 6.46139 17.6 6.46139"
          stroke={color}
          strokeWidth="1.129"
          strokeLinecap="round"
        />
        <path
          d="M23.1175 24.0217C23.3752 24.6248 24.2546 25.5536 24.8255 25.8612C25.3655 26.1543 25.9209 26.404 26.4516 26.5355C27.1012 26.6983 28.4697 26.6489 28.4697 26.6489"
          stroke={color}
          strokeWidth="1.129"
          strokeLinecap="round"
        />
        <path
          d="M22.9521 23.836C22.7132 24.4687 21.7277 25.4389 21.2889 25.7028C20.7641 26.0161 20.1816 26.2186 19.6443 26.3499C18.9853 26.5126 17.6 26.4632 17.6 26.4632"
          stroke={color}
          strokeWidth="1.129"
          strokeLinecap="round"
        />
        <path d="M23.0192 9.48987L23.0192 24.0546" stroke={color} strokeWidth="1.129" strokeLinecap="round" />
        <path d="M20.0088 18.636H26.03" stroke={color} strokeWidth="1.129" strokeLinecap="round" />
      </svg>
    )
  },
)

export default TextSelect
