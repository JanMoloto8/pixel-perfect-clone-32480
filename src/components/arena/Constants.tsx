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

export const POINTS: [number, number][] = [0, 100, 200].flatMap((o) => ringPoints(o));

export const RING_EDGES = [
    [0, 1],
    [1, 2],
    [2, 4],
    [4, 7],
    [7, 6],
    [6, 5],
    [5, 3],
    [3, 0],
];

export const EDGES: [number, number][] = [
    ...[0, 8, 16].flatMap((base) =>
        RING_EDGES.map(([a, b]) => [a + base, b + base] as [number, number]),
    ),
    [1, 9],
    [9, 17],
    [3, 11],
    [11, 19],
    [4, 12],
    [12, 20],
    [6, 14],
    [14, 22],
    [0, 8],
    [8, 16],
    [2, 10],
    [10, 18],
    [5, 13],
    [13, 21],
    [7, 15],
    [15, 23],
];
