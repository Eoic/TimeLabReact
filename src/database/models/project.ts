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

export interface PlotConfig {
  axes: PlotAxes;
  guides: PlotGuides;
  appearance: PlotAppearance;
}

export interface Project extends IDBRecord {
  id: string;
  title: string;
  description: string;
  createdAt: number;
  updatedAt: number | null;
  isSelected: boolean;
  plotConfig: PlotConfig;
}
