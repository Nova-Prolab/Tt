import React from 'react';
import { cn } from "@/lib/utils";

type AvatarProps = {
  size?: number;
  shape?: 'circle' | 'square';
  className?: string;
  [key: string]: any;
};

// This wrapper component replicates the styling of the original @lobehub/icons Avatar
const AvatarWrapper: React.FC<React.PropsWithChildren<AvatarProps>> = ({
  size = 20,
  shape = 'circle',
  className,
  children,
  ...props
}) => {
  const style = {
    width: size,
    height: size,
  };

  return (
    <div
      style={style}
      className={cn(
        'flex items-center justify-center overflow-hidden bg-transparent',
        shape === 'circle' ? 'rounded-full' : 'rounded-md',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

// Official SVG for Gemini Icon
const GeminiIcon = ({ size = 20, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 1024 1024"
    fill="currentColor"
    {...props}
  >
    <path
      d="M878.912 498.88a31.936 31.936 0 0 0-31.424-22.336H614.4a31.936 31.936 0 0 0-31.424 22.336L533.312 626.56a32 32 0 0 0 22.272 40.448l3.712 1.216a32.064 32.064 0 0 0 40.512-22.272l49.728-128h128v49.792a32 32 0 0 0 54.464 22.528l3.648-3.648a31.936 31.936 0 0 0 22.528-54.464zM395.264 533.376a32 32 0 0 0-40.512 22.272L305.024 683.904a32 32 0 0 0 22.272 40.448l3.712 1.216a32.064 32.064 0 0 0 40.512-22.272l49.728-128a32 32 0 0 0-26-42.24zM409.6 281.6a32 32 0 0 0-31.424-22.336H145.088a31.936 31.936 0 0 0-31.424 22.336L64 409.6a32 32 0 0 0 22.272 40.512l3.712 1.216A32 32 0 0 0 128 429.056l49.792-128h128v49.728a32.064 32.064 0 0 0 54.464 22.528l3.648-3.648A31.936 31.936 0 0 0 409.6 345.6zM849.28 214.272a31.936 31.936 0 0 0-45.248 0L629.76 388.608a32.064 32.064 0 0 0 0 45.248l3.648 3.648a31.936 31.936 0 0 0 45.248 0L853.12 253.12a32.064 32.064 0 0 0 0-45.248z"
    />
  </svg>
)

// Official SVG for DeepSeek Icon
const DeepSeekIcon = ({ size = 20, ...props }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="currentColor"
        {...props}
    >
        <path
            d="M11.939 21.25a9.25 9.25 0 0 1-9.25-9.25V3h1.5v9a7.75 7.75 0 0 0 7.75 7.75h8.25v-1.5h-8.25Z"
        />
    </svg>
);


const GeminiAvatar = (props: AvatarProps) => (
  <AvatarWrapper {...props}>
    <GeminiIcon size={props.size ? props.size * 0.8 : 16} />
  </AvatarWrapper>
);

const DeepSeekAvatar = (props: AvatarProps) => (
  <AvatarWrapper {...props}>
    <DeepSeekIcon size={props.size ? props.size * 0.8 : 16} />
  </AvatarWrapper>
);

export const Gemini = { Avatar: GeminiAvatar };
export const DeepSeek = { Avatar: DeepSeekAvatar };
