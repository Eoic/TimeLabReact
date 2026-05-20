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

type PlotConfigSectionProps = {
  children?: React.ReactNode;
  title: string;
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
  const [xAxis, setXAxis] = useState<PlotAxis>('time');
  const [yAxis, setYAxis] = useState<PlotAxis>('amplitude');
  const [downsampling, setDownsampling] = useState<Downsampling>('none');
  const [isSmoothLineEnabled, setIsSmoothLineEnabled] = useState(true);
  const [isAreaFillEnabled, setIsAreaFillEnabled] = useState(true);
  const [isShowPointsEnabled, setIsShowPointsEnabled] = useState(false);
  const [lineWidth, setLineWidth] = useState(2);

  return (
    <Stack spacing={2}>
      <PlotConfigSection title="Axes">
        <Stack spacing={2}>
          <SearchableDropdown label="X axis" onChange={setXAxis} options={axisOptions} value={xAxis} />
          <SearchableDropdown label="Y axis" onChange={setYAxis} options={axisOptions} value={yAxis} />
        </Stack>
      </PlotConfigSection>

      <PlotConfigSection title="Appearance">
        <Stack spacing={1.5}>
          <FormCheckbox
            isChecked={isSmoothLineEnabled}
            label="Smooth line"
            onChange={(isChecked) => setIsSmoothLineEnabled(isChecked)}
          />

          <FormCheckbox
            isChecked={isAreaFillEnabled}
            label="Area fill"
            onChange={(isChecked) => setIsAreaFillEnabled(isChecked)}
          />

          <FormCheckbox
            isChecked={isShowPointsEnabled}
            label="Show points"
            onChange={(isChecked) => setIsShowPointsEnabled(isChecked)}
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
                {lineWidth}px
              </Typography>
            </Box>

            <Slider
              aria-labelledby="line-width-slider-label"
              max={8}
              min={1}
              onChange={(_event, nextValue) => setLineWidth(Array.isArray(nextValue) ? nextValue[0] : nextValue)}
              step={0.5}
              value={lineWidth}
              valueLabelDisplay="auto"
            />
          </Box>

          <SearchableDropdown
            label="Downsampling"
            onChange={(value) => setDownsampling(value)}
            options={downsamplingOptions}
            value={downsampling}
          />
        </Stack>
      </PlotConfigSection>

      <PlotConfigSection title="Guides" />
    </Stack>
  );
}
