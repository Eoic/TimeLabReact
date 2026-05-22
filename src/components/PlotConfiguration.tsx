import Box from '@mui/material/Box';
import Slider from '@mui/material/Slider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import { FormCheckbox } from './FormCheckbox';
import { SearchableDropdown } from './SearchableDropdown';
import type { SearchableDropdownOption } from './SearchableDropdown';

type PlotAxis = 'amplitude' | 'sampleIndex' | 'time';
type Downsampling = 'average' | 'lttb' | 'max' | 'none';

type PlotConfigurationState = {
  axes: {
    x: PlotAxis;
    y: PlotAxis;
  };
  appearance: {
    downsampling: Downsampling;
    isAreaFillEnabled: boolean;
    isShowPointsEnabled: boolean;
    isSmoothLineEnabled: boolean;
    lineWidth: number;
  };
};

type PlotConfigSectionProps = {
  children?: React.ReactNode;
  title: string;
};

const defaultPlotConfiguration: PlotConfigurationState = {
  axes: {
    x: 'time',
    y: 'amplitude',
  },
  appearance: {
    downsampling: 'none',
    isAreaFillEnabled: true,
    isShowPointsEnabled: false,
    isSmoothLineEnabled: true,
    lineWidth: 2,
  },
};

const axisOptions: [SearchableDropdownOption<PlotAxis>, ...SearchableDropdownOption<PlotAxis>[]] = [
  {
    label: 'Time',
    value: 'time',
  },
  {
    label: 'Sample index',
    value: 'sampleIndex',
  },
  {
    label: 'Amplitude',
    value: 'amplitude',
  },
];

const downsamplingOptions: [SearchableDropdownOption<Downsampling>, ...SearchableDropdownOption<Downsampling>[]] = [
  {
    label: 'None',
    value: 'none',
  },
  {
    label: 'LTTB (quality)',
    value: 'lttb',
  },
  {
    label: 'Average',
    value: 'average',
  },
  {
    label: 'Max',
    value: 'max',
  },
];

function PlotConfigSection({ children, title }: PlotConfigSectionProps) {
  return (
    <Box component="section" sx={{ px: 1 }}>
      <Typography component="h3" sx={{ mb: children ? 0.2 : 0 }} variant="overline">
        {title}
      </Typography>
      {children}
    </Box>
  );
}

export function PlotConfiguration() {
  const [configuration, setConfiguration] = useState<PlotConfigurationState>(defaultPlotConfiguration);

  const updateAxis = (axis: keyof PlotConfigurationState['axes'], value: PlotAxis) => {
    setConfiguration((currentConfiguration) => ({
      ...currentConfiguration,
      axes: {
        ...currentConfiguration.axes,
        [axis]: value,
      },
    }));
  };

  const updateAppearance = <TKey extends keyof PlotConfigurationState['appearance']>(
    key: TKey,
    value: PlotConfigurationState['appearance'][TKey],
  ) => {
    setConfiguration((currentConfiguration) => ({
      ...currentConfiguration,
      appearance: {
        ...currentConfiguration.appearance,
        [key]: value,
      },
    }));
  };

  return (
    <Stack spacing={2}>
      <PlotConfigSection title="Axes">
        <Stack spacing={2}>
          <SearchableDropdown
            label="X axis"
            onChange={(value) => updateAxis('x', value)}
            options={axisOptions}
            value={configuration.axes.x}
          />
          <SearchableDropdown
            label="Y axis"
            onChange={(value) => updateAxis('y', value)}
            options={axisOptions}
            value={configuration.axes.y}
          />
        </Stack>
      </PlotConfigSection>

      <PlotConfigSection title="Appearance">
        <Stack spacing={1.5}>
          <FormCheckbox
            isChecked={configuration.appearance.isSmoothLineEnabled}
            label="Smooth line"
            onChange={(isChecked) => updateAppearance('isSmoothLineEnabled', isChecked)}
          />

          <FormCheckbox
            isChecked={configuration.appearance.isAreaFillEnabled}
            label="Area fill"
            onChange={(isChecked) => updateAppearance('isAreaFillEnabled', isChecked)}
          />

          <FormCheckbox
            isChecked={configuration.appearance.isShowPointsEnabled}
            label="Show points"
            onChange={(isChecked) => updateAppearance('isShowPointsEnabled', isChecked)}
          />

          <Box>
            <Box
              sx={{
                alignItems: 'center',
                display: 'flex',
                justifyContent: 'space-between',
                mb: 0.5,
              }}
            >
              <Typography component="label" id="line-width-slider-label" variant="body2">
                Line width
              </Typography>
              <Typography color="text.secondary" variant="caption">
                {configuration.appearance.lineWidth}px
              </Typography>
            </Box>

            <Slider
              aria-labelledby="line-width-slider-label"
              max={8}
              min={1}
              onChange={(_event, nextValue) =>
                updateAppearance('lineWidth', Array.isArray(nextValue) ? (nextValue[0] ?? 1) : nextValue)
              }
              step={0.5}
              value={configuration.appearance.lineWidth}
              valueLabelDisplay="auto"
            />
          </Box>

          <SearchableDropdown
            label="Downsampling"
            onChange={(value) => updateAppearance('downsampling', value)}
            options={downsamplingOptions}
            value={configuration.appearance.downsampling}
          />
        </Stack>
      </PlotConfigSection>

      <PlotConfigSection title="Guides" />
    </Stack>
  );
}
