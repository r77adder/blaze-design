import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const ShareForReview = forwardRef<SVGSVGElement, IconProps>(
  ({ color = 'currentColor', size = 36 }, forwardedRef) => {
    return (
      <svg
        width={size}
        height={size}
        style={{ width: size, height: size }}
        viewBox="0 0 36 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        ref={forwardedRef}
      >
        <g filter="url(#filter0_di_2591_28599)">
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M16.2987 14.2603C25.3998 14.2603 28.7431 19.4745 28.7431 23.643C28.7431 27.8116 19.1467 28.4859 16.2987 28.4859V28.4855C13.4507 28.4855 3.85425 27.8111 3.85425 23.6425C3.85425 19.474 7.19753 14.3085 16.2987 14.3085V14.2603Z"
            fill="url(#paint0_linear_2591_28599)"
          />
        </g>
        <g filter="url(#filter1_di_2591_28599)">
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M16.2982 1.57675C11.7618 1.57677 9.49365 5.07101 9.49365 7.89092C9.49365 11.8141 12.4972 15.4591 16.2977 15.4595C16.298 15.4708 16.2982 15.4818 16.2982 15.4924C20.099 15.4924 23.1028 11.8143 23.1028 7.89092C23.1028 5.071 20.8346 1.57675 16.2982 1.57675Z"
            fill="url(#paint1_radial_2591_28599)"
          />
        </g>
        <g filter="url(#filter2_d_2591_28599)">
          <path
            d="M25.5591 13.9097C25.7472 13.7463 26.0269 13.7463 26.215 13.9097L27.1273 14.7023C27.2715 14.8276 27.4745 14.8598 27.6504 14.7852L28.763 14.3133C28.9924 14.216 29.2584 14.3024 29.3868 14.5159L30.0095 15.5517C30.1079 15.7154 30.2911 15.8087 30.4814 15.7921L31.6854 15.6871C31.9336 15.6655 32.1599 15.8299 32.216 16.0726L32.4882 17.2501C32.5312 17.4363 32.6765 17.5816 32.8627 17.6246L34.0402 17.8968C34.2829 17.953 34.4473 18.1792 34.4257 18.4274L34.3207 19.6314C34.3041 19.8217 34.3974 20.0049 34.5611 20.1033L35.5969 20.726C35.8104 20.8544 35.8968 21.1204 35.7995 21.3498L35.3276 22.4624C35.253 22.6383 35.2852 22.8413 35.4105 22.9855L36.2031 23.8978C36.3665 24.0859 36.3665 24.3656 36.2031 24.5537L35.4105 25.466C35.2852 25.6102 35.253 25.8132 35.3276 25.9891L35.7995 27.1017C35.8968 27.3311 35.8104 27.5971 35.5969 27.7254L34.5611 28.3482C34.3974 28.4466 34.3041 28.6298 34.3207 28.8201L34.4257 30.0241C34.4473 30.2723 34.2829 30.4985 34.0402 30.5547L32.8627 30.8268C32.6765 30.8699 32.5312 31.0152 32.4882 31.2014L32.216 32.3788C32.1599 32.6216 31.9336 32.786 31.6854 32.7643L30.4814 32.6594C30.2911 32.6428 30.1079 32.7361 30.0095 32.8998L29.3868 33.9355C29.2584 34.1491 28.9924 34.2355 28.763 34.1382L27.6504 33.6663C27.4745 33.5917 27.2715 33.6239 27.1273 33.7492L26.215 34.5418C26.0269 34.7052 25.7472 34.7052 25.5591 34.5418L24.6468 33.7492C24.5026 33.6239 24.2996 33.5917 24.1237 33.6663L23.0111 34.1382C22.7817 34.2355 22.5157 34.1491 22.3874 33.9355L21.7646 32.8998C21.6662 32.7361 21.483 32.6428 21.2927 32.6594L20.0887 32.7643C19.8405 32.786 19.6143 32.6216 19.5582 32.3788L19.286 31.2014C19.2429 31.0152 19.0976 30.8699 18.9114 30.8268L17.734 30.5547C17.4912 30.4985 17.3268 30.2723 17.3485 30.0241L17.4534 28.8201C17.47 28.6298 17.3767 28.4466 17.213 28.3482L16.1773 27.7254C15.9637 27.5971 15.8773 27.3311 15.9746 27.1017L16.4465 25.9891C16.5211 25.8132 16.4889 25.6102 16.3636 25.466L15.571 24.5537C15.4076 24.3656 15.4076 24.0859 15.571 23.8978L16.3636 22.9855C16.4889 22.8413 16.5211 22.6383 16.4465 22.4624L15.9746 21.3498C15.8773 21.1204 15.9637 20.8544 16.1773 20.726L17.213 20.1033C17.3767 20.0049 17.47 19.8217 17.4534 19.6314L17.3485 18.4274C17.3268 18.1792 17.4912 17.953 17.734 17.8968L18.9114 17.6246C19.0976 17.5816 19.2429 17.4363 19.286 17.2501L19.5582 16.0726C19.6143 15.8299 19.8405 15.6655 20.0887 15.6871L21.2927 15.7921C21.483 15.8087 21.6662 15.7154 21.7646 15.5517L22.3874 14.5159C22.5157 14.3024 22.7817 14.216 23.0111 14.3133L24.1237 14.7852C24.2996 14.8598 24.5026 14.8276 24.6468 14.7023L25.5591 13.9097Z"
            fill="url(#paint2_radial_2591_28599)"
          />
          <path
            d="M26.051 14.0984L26.9633 14.891C27.1797 15.079 27.4842 15.1272 27.7481 15.0153L28.8606 14.5434C28.9753 14.4948 29.1083 14.538 29.1725 14.6448L29.7952 15.6805C29.9429 15.9261 30.2176 16.0661 30.5032 16.0412L31.7071 15.9362C31.8312 15.9254 31.9443 16.0076 31.9724 16.129L32.2446 17.3064C32.3091 17.5856 32.5272 17.8037 32.8064 17.8682L33.9839 18.1404C34.1052 18.1685 34.1874 18.2816 34.1766 18.4057L34.0716 19.6097C34.0467 19.8952 34.1867 20.1699 34.4323 20.3176L35.468 20.9403C35.5748 21.0045 35.618 21.1375 35.5694 21.2522L35.0975 22.3647C34.9856 22.6286 35.0338 22.9331 35.2218 23.1495L36.0144 24.0618C36.0961 24.1558 36.0961 24.2957 36.0144 24.3897L35.2218 25.302C35.0338 25.5184 34.9856 25.8229 35.0975 26.0867L35.5694 27.1993C35.618 27.314 35.5748 27.447 35.468 27.5112L34.4323 28.1339C34.1867 28.2816 34.0467 28.5563 34.0716 28.8418L34.1766 30.0458C34.1874 30.1699 34.1052 30.283 33.9839 30.3111L32.8064 30.5833C32.5272 30.6478 32.3091 30.8659 32.2446 31.1451L31.9724 32.3225C31.9443 32.4439 31.8312 32.5261 31.7071 32.5153L30.5032 32.4103C30.2176 32.3854 29.9429 32.5254 29.7952 32.771L29.1725 33.8067C29.1083 33.9135 28.9753 33.9567 28.8606 33.9081L27.7481 33.4362C27.4842 33.3243 27.1797 33.3725 26.9633 33.5605L26.051 34.3531C25.957 34.4348 25.8171 34.4348 25.7231 34.3531L24.8108 33.5605C24.5944 33.3725 24.2899 33.3243 24.0261 33.4362L22.9135 33.9081C22.7988 33.9567 22.6658 33.9135 22.6016 33.8067L21.9789 32.771C21.8312 32.5254 21.5565 32.3854 21.271 32.4103L20.067 32.5153C19.9429 32.5261 19.8298 32.4439 19.8017 32.3225L19.5295 31.1451C19.465 30.8659 19.247 30.6478 18.9677 30.5833L17.7903 30.3111C17.6689 30.283 17.5867 30.1699 17.5975 30.0458L17.7025 28.8418C17.7274 28.5563 17.5874 28.2816 17.3418 28.1339L16.3061 27.5112C16.1993 27.447 16.1561 27.314 16.2047 27.1993L16.6766 26.0867C16.7885 25.8229 16.7403 25.5184 16.5523 25.302L15.7597 24.3897C15.678 24.2957 15.678 24.1558 15.7597 24.0618L16.5523 23.1495C16.7403 22.9331 16.7885 22.6286 16.6766 22.3647L16.2047 21.2522C16.1561 21.1375 16.1993 21.0045 16.3061 20.9403L17.3418 20.3176C17.5874 20.1699 17.7274 19.8952 17.7025 19.6097L17.5975 18.4057C17.5867 18.2816 17.6689 18.1685 17.7903 18.1404L18.9677 17.8682C19.247 17.8037 19.465 17.5856 19.5295 17.3064L19.8017 16.129C19.8298 16.0076 19.9429 15.9254 20.067 15.9362L21.271 16.0412C21.5565 16.0661 21.8312 15.9261 21.9789 15.6805L22.6016 14.6448C22.6658 14.538 22.7988 14.4948 22.9135 14.5434L24.0261 15.0153C24.2899 15.1272 24.5944 15.079 24.8108 14.891L25.7231 14.0984C25.8171 14.0167 25.957 14.0167 26.051 14.0984Z"
            stroke="#028B10"
            strokeWidth="0.5"
          />
        </g>
        <g filter="url(#filter3_di_2591_28599)">
          <path
            d="M22.0647 25.0044L25.3341 27.9823L29.7101 20.4688"
            stroke="white"
            strokeOpacity="0.87"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            shapeRendering="auto"
          />
        </g>
        <defs>
          <filter
            id="filter0_di_2591_28599"
            x="0.854248"
            y="14.2603"
            width="30.8889"
            height="21.2257"
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
            <feOffset dy="4" />
            <feGaussianBlur stdDeviation="1.5" />
            <feComposite in2="hardAlpha" operator="out" />
            <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.11 0" />
            <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_2591_28599" />
            <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_2591_28599" result="shape" />
            <feColorMatrix
              in="SourceAlpha"
              type="matrix"
              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
              result="hardAlpha"
            />
            <feOffset dx="0.5" dy="0.5" />
            <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
            <feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.25 0" />
            <feBlend mode="normal" in2="shape" result="effect2_innerShadow_2591_28599" />
          </filter>
          <filter
            id="filter1_di_2591_28599"
            x="6.49365"
            y="1.57675"
            width="19.6091"
            height="20.9157"
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
            <feOffset dy="4" />
            <feGaussianBlur stdDeviation="1.5" />
            <feComposite in2="hardAlpha" operator="out" />
            <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.11 0" />
            <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_2591_28599" />
            <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_2591_28599" result="shape" />
            <feColorMatrix
              in="SourceAlpha"
              type="matrix"
              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
              result="hardAlpha"
            />
            <feOffset dx="0.5" dy="0.5" />
            <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
            <feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.25 0" />
            <feBlend mode="normal" in2="shape" result="effect2_innerShadow_2591_28599" />
          </filter>
          <filter
            id="filter2_d_2591_28599"
            x="13.4485"
            y="13.7872"
            width="24.8772"
            height="24.8772"
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
            <feOffset dy="2" />
            <feGaussianBlur stdDeviation="1" />
            <feComposite in2="hardAlpha" operator="out" />
            <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.15 0" />
            <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_2591_28599" />
            <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_2591_28599" result="shape" />
          </filter>
          <filter
            id="filter3_di_2591_28599"
            x="17.0647"
            y="19.4687"
            width="17.6455"
            height="17.5136"
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
            <feOffset dy="4" />
            <feGaussianBlur stdDeviation="2" />
            <feComposite in2="hardAlpha" operator="out" />
            <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
            <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_2591_28599" />
            <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_2591_28599" result="shape" />
            <feColorMatrix
              in="SourceAlpha"
              type="matrix"
              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
              result="hardAlpha"
            />
            <feOffset dx="0.1" dy="0.1" />
            <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
            <feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.95 0" />
            <feBlend mode="normal" in2="shape" result="effect2_innerShadow_2591_28599" />
          </filter>
          <linearGradient
            id="paint0_linear_2591_28599"
            x1="16.2987"
            y1="17.688"
            x2="16.2987"
            y2="28.4859"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#5D00D4" />
            <stop offset="1" stopColor="#BD2AF0" />
          </linearGradient>
          <radialGradient
            id="paint1_radial_2591_28599"
            cx="0"
            cy="0"
            r="1"
            gradientUnits="userSpaceOnUse"
            gradientTransform="translate(13.7401 5.42548) rotate(51.1466) scale(10.4012 10.1721)"
          >
            <stop stopColor="#A52AF0" />
            <stop offset="1" stopColor="#5D00D4" />
          </radialGradient>
          <radialGradient
            id="paint2_radial_2591_28599"
            cx="0"
            cy="0"
            r="1"
            gradientUnits="userSpaceOnUse"
            gradientTransform="translate(21.396 16.5751) rotate(58.5513) scale(16.0945)"
          >
            <stop stopColor="#11EA27" />
            <stop offset="1" stopColor="#018F10" />
          </radialGradient>
        </defs>
      </svg>
    )
  },
)

export default ShareForReview
