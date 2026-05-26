import type { IDBRecord } from '../storage';

export type PlotAxis = 'amplitude' | 'sampleIndex' | 'time';
export type Downsampling = 'average' | 'lttb' | 'max' | 'none';

export type Threshold = {
  id: string;
  axis: 'x' | 'y';
  value: number;
  color: string;
  label: string;
  style: 'solid' | 'dashed';
};

export type PlotAxes = {
  x: PlotAxis;
  y: PlotAxis;
};

export type PlotGuides = {
  thresholds: Threshold[];
};

export type PlotAppearance = {
  downsampling: Downsampling;
  isAreaFillEnabled: boolean;
  isShowPointsEnabled: boolean;
  isSmoothLineEnabled: boolean;
  isShowGridlinesEnabled: boolean;
  lineWidth: number;
};

export interface PlotConfiguration extends IDBRecord {
  id: string;
  axes: PlotAxes;
  guides: PlotGuides;
  appearance: PlotAppearance;
  projectId: string;
}
