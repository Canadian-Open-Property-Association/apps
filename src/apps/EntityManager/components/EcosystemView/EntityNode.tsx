import type { Entity } from '../../../../types/entity';
import { useState } from 'react';

interface EntityNodeProps {
  entity: Entity;
  logoUrl: string | null;
  x: number;
  y: number;
  onClick: (event: React.MouseEvent) => void;
  isSelected?: boolean;
  animationDelay?: number;
  size?: number;
  onHover?: (entity: Entity | null, x: number, y: number) => void;
}

export default function EntityNode({
  entity,
  logoUrl,
  x,
  y,
  onClick,
  isSelected = false,
  animationDelay = 0,
  size = 48,
  onHover,
}: EntityNodeProps) {
  const [imageError, setImageError] = useState(false);

  const halfSize = size / 2;

  const handleMouseEnter = () => {
    if (onHover) {
      onHover(entity, x, y - halfSize - 12);
    }
  };

  const handleMouseLeave = () => {
    if (onHover) {
      onHover(null, 0, 0);
    }
  };

  return (
    <g
      transform={`translate(${x}, ${y})`}
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="cursor-pointer entity-node"
    >
      {/* Inner group for animation - separates position from animation transform */}
      <g
        className="entity-node-inner"
        style={{
          animationDelay: `${animationDelay}s`,
        }}
      >
        {/* Glow effect on hover/selection */}
        <circle
          cx={0}
          cy={0}
          r={halfSize + 4}
          className={`transition-all duration-200 ${
            isSelected
              ? 'fill-blue-500/30'
              : 'fill-transparent hover:fill-white/10'
          }`}
          style={{
            filter: isSelected ? 'blur(8px)' : undefined,
          }}
        />

        {/* Background circle */}
        <circle
          cx={0}
          cy={0}
          r={halfSize}
          className={`fill-slate-700 stroke-slate-500 transition-all duration-200 ${
            isSelected ? 'stroke-blue-400 stroke-2' : 'stroke-1 hover:stroke-slate-400'
          }`}
        />

        {/* Clip path for logo */}
        <defs>
          <clipPath id={`clip-${entity.id}`}>
            <circle cx={0} cy={0} r={halfSize - 4} />
          </clipPath>
        </defs>

        {/* Logo or initials */}
        {logoUrl && !imageError ? (
          <image
            href={logoUrl}
            x={-halfSize + 4}
            y={-halfSize + 4}
            width={size - 8}
            height={size - 8}
            clipPath={`url(#clip-${entity.id})`}
            preserveAspectRatio="xMidYMid slice"
            onError={() => setImageError(true)}
            className="pointer-events-none"
          />
        ) : (
          <text
            x={0}
            y={0}
            textAnchor="middle"
            dominantBaseline="central"
            className="fill-slate-300 text-xs font-medium pointer-events-none select-none"
            style={{ fontSize: '14px' }}
          >
            {entity.name.substring(0, 2).toUpperCase()}
          </text>
        )}
      </g>
    </g>
  );
}
