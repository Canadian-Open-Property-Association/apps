import type { Entity, DataProviderType } from '../../../../types/entity';
import EntityNode from './EntityNode';

interface OrbitalSegmentProps {
  dataType: DataProviderType;
  label: string;
  entities: Entity[];
  segmentIndex: number;
  totalSegments: number;
  centerX: number;
  centerY: number;
  innerRadius: number;
  outerRadius: number;
  getLogoUrl: (entity: Entity) => string | null;
  onEntityClick: (entity: Entity, event: React.MouseEvent) => void;
  onSegmentClick: (dataType: DataProviderType, event: React.MouseEvent) => void;
  selectedEntityId?: string | null;
}

// Colors for each data type segment
const SEGMENT_COLORS: Record<DataProviderType, { fill: string; stroke: string; glow: string }> = {
  'identity': { fill: 'rgba(139, 92, 246, 0.15)', stroke: 'rgba(139, 92, 246, 0.4)', glow: 'rgba(139, 92, 246, 0.3)' },
  'title-ownership': { fill: 'rgba(59, 130, 246, 0.15)', stroke: 'rgba(59, 130, 246, 0.4)', glow: 'rgba(59, 130, 246, 0.3)' },
  'assessment': { fill: 'rgba(16, 185, 129, 0.15)', stroke: 'rgba(16, 185, 129, 0.4)', glow: 'rgba(16, 185, 129, 0.3)' },
  'market-value-estimate': { fill: 'rgba(245, 158, 11, 0.15)', stroke: 'rgba(245, 158, 11, 0.4)', glow: 'rgba(245, 158, 11, 0.3)' },
  'cost-of-ownership': { fill: 'rgba(236, 72, 153, 0.15)', stroke: 'rgba(236, 72, 153, 0.4)', glow: 'rgba(236, 72, 153, 0.3)' },
  'mortgage-home-equity': { fill: 'rgba(239, 68, 68, 0.15)', stroke: 'rgba(239, 68, 68, 0.4)', glow: 'rgba(239, 68, 68, 0.3)' },
  'municipal': { fill: 'rgba(34, 211, 238, 0.15)', stroke: 'rgba(34, 211, 238, 0.4)', glow: 'rgba(34, 211, 238, 0.3)' },
  'regulatory': { fill: 'rgba(251, 191, 36, 0.15)', stroke: 'rgba(251, 191, 36, 0.4)', glow: 'rgba(251, 191, 36, 0.3)' },
  'employment': { fill: 'rgba(168, 85, 247, 0.15)', stroke: 'rgba(168, 85, 247, 0.4)', glow: 'rgba(168, 85, 247, 0.3)' },
};

function polarToCartesian(centerX: number, centerY: number, radius: number, angleInDegrees: number) {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
}

function describeArc(
  x: number,
  y: number,
  innerRadius: number,
  outerRadius: number,
  startAngle: number,
  endAngle: number
) {
  const start1 = polarToCartesian(x, y, outerRadius, endAngle);
  const end1 = polarToCartesian(x, y, outerRadius, startAngle);
  const start2 = polarToCartesian(x, y, innerRadius, startAngle);
  const end2 = polarToCartesian(x, y, innerRadius, endAngle);

  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';

  return [
    'M', start1.x, start1.y,
    'A', outerRadius, outerRadius, 0, largeArcFlag, 0, end1.x, end1.y,
    'L', start2.x, start2.y,
    'A', innerRadius, innerRadius, 0, largeArcFlag, 1, end2.x, end2.y,
    'Z',
  ].join(' ');
}

export default function OrbitalSegment({
  dataType,
  label,
  entities,
  segmentIndex,
  totalSegments,
  centerX,
  centerY,
  innerRadius,
  outerRadius,
  getLogoUrl,
  onEntityClick,
  onSegmentClick,
  selectedEntityId,
}: OrbitalSegmentProps) {
  const colors = SEGMENT_COLORS[dataType];

  // Calculate segment angles
  const gapAngle = 2; // Gap between segments in degrees
  const segmentAngle = (360 - totalSegments * gapAngle) / totalSegments;
  const startAngle = segmentIndex * (segmentAngle + gapAngle);
  const endAngle = startAngle + segmentAngle;

  // Position entities along the segment arc
  const entityRadius = (innerRadius + outerRadius) / 2;
  const entityPositions = entities.map((entity, i) => {
    const angleRange = endAngle - startAngle - 10; // Leave some padding
    const angleStep = entities.length > 1 ? angleRange / (entities.length - 1) : 0;
    const angle = startAngle + 5 + (entities.length === 1 ? angleRange / 2 : i * angleStep);
    const pos = polarToCartesian(centerX, centerY, entityRadius, angle);
    return { entity, ...pos, angle };
  });

  // Label position (middle of the segment, outside the arc)
  const labelAngle = (startAngle + endAngle) / 2;
  const labelPos = polarToCartesian(centerX, centerY, outerRadius + 30, labelAngle);

  // Calculate label rotation so text is readable
  let labelRotation = labelAngle - 90;
  if (labelRotation > 90) labelRotation -= 180;
  if (labelRotation < -90) labelRotation += 180;

  const arcPath = describeArc(centerX, centerY, innerRadius, outerRadius, startAngle, endAngle);

  const hasEntities = entities.length > 0;

  return (
    <g className="orbital-segment">
      {/* Segment arc background */}
      <path
        d={arcPath}
        fill={colors.fill}
        stroke={colors.stroke}
        strokeWidth={1}
        className="cursor-pointer transition-all duration-200 hover:brightness-125"
        onClick={(e) => onSegmentClick(dataType, e)}
        style={{
          filter: hasEntities ? `drop-shadow(0 0 10px ${colors.glow})` : undefined,
        }}
      />

      {/* Segment label */}
      <g
        transform={`translate(${labelPos.x}, ${labelPos.y}) rotate(${labelRotation})`}
        className="cursor-pointer"
        onClick={(e) => onSegmentClick(dataType, e)}
      >
        <text
          textAnchor="middle"
          dominantBaseline="central"
          className="fill-slate-300 text-xs font-medium pointer-events-none select-none"
          style={{ fontSize: '11px' }}
        >
          {label}
        </text>
        {/* Entity count badge */}
        <text
          y={14}
          textAnchor="middle"
          dominantBaseline="central"
          className="fill-slate-500 text-xs pointer-events-none select-none"
          style={{ fontSize: '10px' }}
        >
          {entities.length === 0 ? '(empty)' : `(${entities.length})`}
        </text>
      </g>

      {/* Entity nodes */}
      {entityPositions.map(({ entity, x, y }, i) => (
        <EntityNode
          key={entity.id}
          entity={entity}
          logoUrl={getLogoUrl(entity)}
          x={x}
          y={y}
          onClick={(e) => onEntityClick(entity, e)}
          isSelected={selectedEntityId === entity.id}
          animationDelay={i * 0.2}
        />
      ))}
    </g>
  );
}
