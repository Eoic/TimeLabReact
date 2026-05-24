import type { PlotAppearance, PlotAxes, PlotGuides } from '../database/models';

export interface PlotConfigurationFormData {
  axes: PlotAxes;
  guides: PlotGuides;
  appearance: PlotAppearance;
}
