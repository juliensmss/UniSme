import { EnergyDataPoint, RegressionStats } from '../types/energy';

export function calculateRegression(
  data: EnergyDataPoint[],
  xKey: keyof EnergyDataPoint,
  yKey: keyof EnergyDataPoint
): RegressionStats {
  const points = data
    .map(d => ({
      x: Number(d[xKey]),
      y: Number(d[yKey])
    }))
    .filter(p => !isNaN(p.x) && !isNaN(p.y));

  const n = points.length;
  if (n === 0) {
    return {
      slope: 0,
      intercept: 0,
      r2: 0,
      r: 0,
      points: [],
      trendline: []
    };
  }

  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumXX = 0;
  let sumYY = 0;

  for (let i = 0; i < n; i++) {
    const px = points[i].x;
    const py = points[i].y;
    sumX += px;
    sumY += py;
    sumXY += px * py;
    sumXX += px * px;
    sumYY += py * py;
  }

  const denominator = n * sumXX - sumX * sumX;
  const slope = denominator !== 0 ? (n * sumXY - sumX * sumY) / denominator : 0;
  const intercept = (sumY - slope * sumX) / n;

  // Correlation coefficient r
  const rDenom = Math.sqrt((n * sumXX - sumX * sumX) * (n * sumYY - sumY * sumY));
  const r = rDenom !== 0 ? (n * sumXY - sumX * sumY) / rDenom : 0;
  const r2 = r * r;

  // Trendline endpoints
  let minX = Infinity;
  let maxX = -Infinity;
  for (let i = 0; i < n; i++) {
    if (points[i].x < minX) minX = points[i].x;
    if (points[i].x > maxX) maxX = points[i].x;
  }

  if (minX === Infinity) {
    minX = 0;
    maxX = 1;
  }

  const trendline = [
    { x: minX, y: slope * minX + intercept },
    { x: maxX, y: slope * maxX + intercept }
  ];

  return {
    slope,
    intercept,
    r2,
    r,
    points,
    trendline
  };
}

export function calculateCorrelationMatrix(
  data: EnergyDataPoint[],
  keys: (keyof EnergyDataPoint)[]
): { keys: (keyof EnergyDataPoint)[]; matrix: number[][] } {
  const n = data.length;
  const matrix: number[][] = [];

  // Extract arrays
  const vectors: number[][] = keys.map(k => data.map(d => Number(d[k]) || 0));

  // Compute means and stds
  const means: number[] = vectors.map(vec => vec.reduce((a, b) => a + b, 0) / n);
  const stds: number[] = vectors.map((vec, idx) => {
    const mean = means[idx];
    const variance = vec.reduce((acc, val) => acc + (val - mean) ** 2, 0) / n;
    return Math.sqrt(variance);
  });

  for (let i = 0; i < keys.length; i++) {
    const row: number[] = [];
    for (let j = 0; j < keys.length; j++) {
      if (i === j) {
        row.push(1);
      } else {
        const stdProduct = stds[i] * stds[j];
        if (stdProduct === 0) {
          row.push(0);
        } else {
          let cov = 0;
          for (let k = 0; k < n; k++) {
            cov += (vectors[i][k] - means[i]) * (vectors[j][k] - means[j]);
          }
          cov /= n;
          const corr = Math.max(-1, Math.min(1, cov / stdProduct));
          row.push(Math.round(corr * 100) / 100);
        }
      }
    }
    matrix.push(row);
  }

  return { keys, matrix };
}
