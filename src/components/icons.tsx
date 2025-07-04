import React from 'react';

type AvatarProps = {
  size?: number;
  [key: string]: any;
};

const GeminiAvatar = ({ size = 20, ...props }: AvatarProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 1024 1024"
    {...props}
  >
    <path
      fill="currentColor"
      d="M878.912 498.88a31.936 31.936 0 0 0-31.424-22.336H614.4a31.936 31.936 0 0 0-31.424 22.336L533.312 626.56a32 32 0 0 0 22.272 40.448l3.712 1.216a32.064 32.064 0 0 0 40.512-22.272l49.728-128h128v49.792a32 32 0 0 0 54.464 22.528l3.648-3.648a31.936 31.936 0 0 0 22.528-54.464zM395.264 533.376a32 32 0 0 0-40.512 22.272L305.024 683.904a32 32 0 0 0 22.272 40.448l3.712 1.216a32.064 32.064 0 0 0 40.512-22.272l49.728-128a32 32 0 0 0-26-42.24zM409.6 281.6a32 32 0 0 0-31.424-22.336H145.088a31.936 31.936 0 0 0-31.424 22.336L64 409.6a32 32 0 0 0 22.272 40.512l3.712 1.216A32 32 0 0 0 128 429.056l49.792-128h128v49.728a32.064 32.064 0 0 0 54.464 22.528l3.648-3.648A31.936 31.936 0 0 0 409.6 345.6zM849.28 214.272a31.936 31.936 0 0 0-45.248 0L629.76 388.608a32.064 32.064 0 0 0 0 45.248l3.648 3.648a31.936 31.936 0 0 0 45.248 0L853.12 253.12a32.064 32.064 0 0 0 0-45.248z"
    />
  </svg>
);

const DeepseekAvatar = ({ size = 20, ...props }: AvatarProps) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width={size}
        height={size}
        viewBox="0 0 24 24"
        {...props}
    >
        <path 
            fill="currentColor" 
            d="M11.939 21.25a9.25 9.25 0 0 1-9.25-9.25V3h1.5v9a7.75 7.75 0 0 0 7.75 7.75h8.25v-1.5h-8.25Z"
        />
    </svg>
);

export const Gemini = { Avatar: GeminiAvatar };
export const Deepseek = { Avatar: DeepseekAvatar };
