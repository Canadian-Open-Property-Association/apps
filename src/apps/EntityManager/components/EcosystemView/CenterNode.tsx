import { useState } from 'react';
import type { Entity } from '../../../../types/entity';

interface CenterNodeProps {
  entity: Entity | null;
  logoUrl: string | null;
  onClick?: (event: React.MouseEvent) => void;
}

export default function CenterNode({ entity, logoUrl, onClick }: CenterNodeProps) {
  const [imageError, setImageError] = useState(false);

  const size = 100;
  const halfSize = size / 2;

  if (!entity) {
    return (
      <g className="center-node">
        {/* Empty state - show placeholder */}
        <circle
          cx={0}
          cy={0}
          r={halfSize}
          className="fill-slate-700 stroke-slate-500 stroke-2"
        />
        <text
          x={0}
          y={0}
          textAnchor="middle"
          dominantBaseline="central"
          className="fill-slate-400 text-sm pointer-events-none select-none"
        >
          No Operator
        </text>
      </g>
    );
  }

  return (
    <g
      className="center-node cursor-pointer"
      onClick={onClick}
      style={{
        animation: 'glow-pulse 4s ease-in-out infinite',
      }}
    >
      {/* Outer glow ring */}
      <circle
        cx={0}
        cy={0}
        r={halfSize + 20}
        className="fill-transparent"
        style={{
          filter: 'drop-shadow(0 0 20px rgba(59, 130, 246, 0.3))',
        }}
      />

      {/* Animated ring */}
      <circle
        cx={0}
        cy={0}
        r={halfSize + 8}
        className="fill-transparent stroke-blue-500/30"
        strokeWidth={2}
        strokeDasharray="8 4"
        style={{
          animation: 'spin 20s linear infinite',
        }}
      />

      {/* Main background circle */}
      <circle
        cx={0}
        cy={0}
        r={halfSize}
        className="fill-slate-800 stroke-blue-500/50 stroke-2 hover:stroke-blue-400 transition-colors"
      />

      {/* Clip path for logo */}
      <defs>
        <clipPath id="center-clip">
          <circle cx={0} cy={0} r={halfSize - 6} />
        </clipPath>
      </defs>

      {/* Logo or initials */}
      {logoUrl && !imageError ? (
        <image
          href={logoUrl}
          x={-halfSize + 12}
          y={-halfSize + 12}
          width={size - 24}
          height={size - 24}
          clipPath="url(#center-clip)"
          preserveAspectRatio="xMidYMid meet"
          onError={() => setImageError(true)}
          className="pointer-events-none"
        />
      ) : (
        <>
          <text
            x={0}
            y={-8}
            textAnchor="middle"
            dominantBaseline="central"
            className="fill-white text-lg font-bold pointer-events-none select-none"
          >
            {entity.name.split(' ').map(w => w[0]).join('').substring(0, 3).toUpperCase()}
          </text>
          <text
            x={0}
            y={16}
            textAnchor="middle"
            dominantBaseline="central"
            className="fill-slate-400 text-xs pointer-events-none select-none"
            style={{ fontSize: '9px' }}
          >
            NETWORK
          </text>
        </>
      )}

      {/* Label below */}
      <text
        x={0}
        y={halfSize + 20}
        textAnchor="middle"
        className="fill-slate-300 text-sm font-medium pointer-events-none select-none"
      >
        {entity.name.length > 20 ? entity.name.substring(0, 20) + '...' : entity.name}
      </text>
    </g>
  );
}
