import React from 'react';
import { LucideIcon } from 'lucide-react';
import { emojiToIconMap, EmojiKey } from '../utils/iconMappings';

interface IconProps {
  emoji?: EmojiKey;
  icon?: LucideIcon;
  size?: number;
  className?: string;
  color?: string;
  onClick?: () => void;
}

const Icon: React.FC<IconProps> = ({
  emoji,
  icon: IconComponent,
  size = 16,
  className = '',
  color,
  onClick
}) => {
  // Prioriza o ícone direto sobre o emoji
  const FinalIcon = IconComponent || (emoji ? emojiToIconMap[emoji] : null);

  if (!FinalIcon) {
    console.warn('Icon component: No valid emoji or icon provided');
    return null;
  }

  const iconElement = (
    <FinalIcon
      size={size}
      className={className}
      style={color ? { color } : undefined}
    />
  );

  if (onClick) {
    return (
      <button
        onClick={onClick}
        className={`icon-button ${className}`}
        style={{
          background: 'none',
          border: 'none',
          padding: 0,
          cursor: 'pointer',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        {iconElement}
      </button>
    );
  }

  return iconElement;
};

export default Icon;
