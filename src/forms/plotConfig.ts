import type { PlotAppearance, PlotAxes, PlotGuides } from '../database/models';

export interface PlotConfigFormData {
  axes: PlotAxes;
  guides: PlotGuides;
  appearance: PlotAppearance;
}
