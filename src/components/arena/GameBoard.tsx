const RING_OFFSET = [0, 100, 200];

function ringPoints(o: number) {
  const a = o;
  const b = 600 - o;
  const m = 300;
  return [
    [a, a],
    [m, a],
    [b, a],
    [a, m],
    [b, m],
    [a, b],
    [m, b],
    [b, b],
  ] as [number, number][];
}

export const POINTS: [number, number][] = RING_OFFSET.flatMap((o) => ringPoints(o));

const RING_EDGES = [
  [0, 1],
  [1, 2],
  [2, 4],
  [4, 7],
  [7, 6],
  [6, 5],
  [5, 3],
  [3, 0],
];

const EDGES: [number, number][] = [
  ...[0, 8, 16].flatMap((base) => RING_EDGES.map(([a, b]) => [a + base, b + base] as [number, number])),
  // spokes
  [1, 9],
  [9, 17],
  [3, 11],
  [11, 19],
  [4, 12],
  [12, 20],
  [6, 14],
  [14, 22],
  // diagonals
  [0, 8],
  [8, 16],
  [2, 10],
  [10, 18],
  [5, 13],
  [13, 21],
  [7, 15],
  [15, 23],
];

export type Cell = "W" | "B" | null;

type Props = {
  cells: Cell[];
  mill: number[];
  lastMove: [number, number];
};

export function GameBoard({ cells, mill, lastMove }: Props) {
  const millSet = new Set(mill);
  const millEdges: [number, number][] = [];
  for (let i = 0; i < mill.length - 1; i++) millEdges.push([mill[i], mill[i + 1]]);

  return (
    <svg viewBox="-40 -40 680 680" className="h-full w-full" role="img" aria-label="Morabaraba board">
      <defs>
        <filter id="mill-glow" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="8" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {EDGES.map(([a, b], i) => (
        <line
          key={i}
          x1={POINTS[a][0]}
          y1={POINTS[a][1]}
          x2={POINTS[b][0]}
          y2={POINTS[b][1]}
          stroke="var(--wood)"
          strokeWidth={9}
          strokeLinecap="round"
        />
      ))}

      {millEdges.map(([a, b], i) => (
        <line
          key={`m${i}`}
          x1={POINTS[a][0]}
          y1={POINTS[a][1]}
          x2={POINTS[b][0]}
          y2={POINTS[b][1]}
          stroke="var(--mill)"
          strokeWidth={7}
          strokeLinecap="round"
          filter="url(#mill-glow)"
        />
      ))}

      <line
        x1={POINTS[lastMove[0]][0]}
        y1={POINTS[lastMove[0]][1]}
        x2={POINTS[lastMove[1]][0]}
        y2={POINTS[lastMove[1]][1]}
        stroke="var(--info)"
        strokeWidth={5}
        strokeDasharray="14 12"
        strokeLinecap="round"
      />

      {POINTS.map(([x, y], i) => {
        const cell = cells[i];
        if (!cell) return <circle key={i} cx={x} cy={y} r={8} fill="var(--wood)" opacity={0.45} />;
        const isMill = millSet.has(i);
        const isLast = lastMove.includes(i);
        return (
          <g key={i} filter={isMill ? "url(#mill-glow)" : undefined}>
            <circle
              cx={x}
              cy={y}
              r={23}
              fill={cell === "W" ? "var(--piece-white)" : "var(--piece-black)"}
              stroke={isMill ? "var(--mill)" : isLast ? "var(--info)" : "var(--border)"}
              strokeWidth={isMill || isLast ? 4 : 2}
            />
          </g>
        );
      })}
    </svg>
  );
}