import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import MenuItem from '@mui/material/MenuItem';
import Slider from '@mui/material/Slider';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useRef, useState } from 'react';
import { useDebounce } from '../hooks/useDebounce';
import { FormCheckbox } from './FormCheckbox';
import { MaterialSymbol } from './MaterialSymbol';
import { SearchableDropdown } from './SearchableDropdown';
import type { SearchableDropdownOption } from './SearchableDropdown';
import type { PlotConfigFormData } from '../forms/plotConfig';
import type { Downsampling, PlotAxis, PlotConfig as ProjectPlotConfig, Threshold } from '../database/models/project';
import { useProjects } from '../hooks/useProjects';

type PlotConfigSectionProps = {
  title: string;
  children?: React.ReactNode;
};

type UpdateThreshold = <TKey extends keyof Threshold>(id: string, key: TKey, value: Threshold[TKey]) => void;

type UpdatePlotConfig = (currentConfiguration: ProjectPlotConfig) => ProjectPlotConfig;

type PlotConfigEditorProps = {
  config: ProjectPlotConfig;
  onPersist: (config: ProjectPlotConfig) => void;
};

type ThresholdEditorProps = {
  index: number;
  threshold: Threshold;
  onUpdate: UpdateThreshold;
  onRemove: (id: string) => void;
};

type ColorFieldProps = {
  name: string;
  value: string;
  label: string;
  onChange: (value: string) => void;
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

const thresholdAxisOptions: [
  SearchableDropdownOption<Threshold['axis']>,
  ...SearchableDropdownOption<Threshold['axis']>[],
] = [
  {
    label: 'X axis',
    value: 'x',
  },
  {
    label: 'Y axis',
    value: 'y',
  },
];

const thresholdStyleOptions: [
  SearchableDropdownOption<Threshold['style']>,
  ...SearchableDropdownOption<Threshold['style']>[],
] = [
  {
    label: 'Solid',
    value: 'solid',
  },
  {
    label: 'Dashed',
    value: 'dashed',
  },
];

const colorCommitDelayMs = 150;
const hexColorPattern = /^#[\da-f]{6}$/i;

function PlotConfigSection({ children, title }: PlotConfigSectionProps) {
  return (
    <Box component="section" sx={{ px: 0 }}>
      <Typography component="h3" sx={{ mb: children ? 0.2 : 0 }} variant="overline">
        {title}
      </Typography>
      {children}
    </Box>
  );
}

function ColorField({ label, name, onChange, value }: ColorFieldProps) {
  const pickerInputRef = useRef<HTMLInputElement>(null);
  const [draft, setDraft] = useState(value);
  const trimmedDraft = draft.trim();
  const swatchColor = hexColorPattern.test(trimmedDraft) ? trimmedDraft : value;

  const commitColor = (nextDraft: string) => {
    const trimmedNextDraft = nextDraft.trim();

    if (!hexColorPattern.test(trimmedNextDraft)) {
      setDraft(value);
      return;
    }

    const nextValue = trimmedNextDraft.toLowerCase();
    setDraft(nextValue);

    if (nextValue !== value) {
      onChange(nextValue);
    }
  };

  const {
    cancel: cancelColorCommit,
    debounce: debounceColorCommit,
    flush: flushColorCommit,
  } = useDebounce(commitColor, colorCommitDelayMs);

  const commitDraft = () => {
    flushColorCommit(draft);
  };

  const scheduleColorCommit = (nextDraft: string) => {
    setDraft(nextDraft);

    if (!hexColorPattern.test(nextDraft)) {
      cancelColorCommit();
      return;
    }

    debounceColorCommit(nextDraft);
  };

  const openPicker = () => {
    pickerInputRef.current?.focus();
    pickerInputRef.current?.click();
  };

  return (
    <Box sx={{ flex: 1, minWidth: 0, position: 'relative' }}>
      <TextField
        fullWidth
        label={label}
        onBlur={commitDraft}
        onChange={(event) => {
          cancelColorCommit();
          setDraft(event.target.value);
        }}
        size="small"
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start" sx={{ mr: 1 }}>
                <Box
                  aria-label={`Pick ${name} color`}
                  component="button"
                  onClick={openPicker}
                  sx={{
                    alignItems: 'center',
                    bgcolor: 'transparent',
                    border: 0,
                    borderRadius: 0.5,
                    cursor: 'pointer',
                    display: 'flex',
                    height: 24,
                    justifyContent: 'left',
                    p: 0,
                    width: 16,
                    '&:focus-visible': {
                      outline: (theme) => `2px solid ${theme.palette.primary.main}`,
                      outlineOffset: 2,
                    },
                  }}
                  type="button"
                >
                  <Box
                    aria-hidden
                    sx={{
                      bgcolor: swatchColor,
                      border: 1,
                      borderColor: 'divider',
                      borderRadius: 0.5,
                      height: 16,
                      width: 16,
                    }}
                  />
                </Box>
              </InputAdornment>
            ),
          },
        }}
        value={draft}
      />
      <Box
        aria-label={`${name} color picker`}
        component="input"
        onChange={(event) => {
          scheduleColorCommit(event.target.value);
        }}
        onBlur={(event) => flushColorCommit(event.currentTarget.value)}
        ref={pickerInputRef}
        sx={{
          height: 1,
          left: 0,
          opacity: 0,
          pointerEvents: 'none',
          position: 'absolute',
          top: 0,
          width: 1,
        }}
        tabIndex={-1}
        type="color"
        value={swatchColor}
      />
    </Box>
  );
}

function ThresholdEditor({ index, onRemove, onUpdate, threshold }: ThresholdEditorProps) {
  const [labelDraft, setLabelDraft] = useState(threshold.label);
  const [valueDraft, setValueDraft] = useState(String(threshold.value));
  const thresholdName = labelDraft.trim() || `Threshold ${index + 1}`;

  const commitLabel = () => {
    if (labelDraft !== threshold.label) {
      onUpdate(threshold.id, 'label', labelDraft);
    }
  };

  const commitValue = () => {
    const nextValue = Number(valueDraft);

    if (!valueDraft.trim() || !Number.isFinite(nextValue)) {
      setValueDraft(String(threshold.value));
      return;
    }

    if (nextValue !== threshold.value) {
      onUpdate(threshold.id, 'value', nextValue);
    }
  };

  return (
    <Box
      component="article"
      sx={{
        border: 1,
        borderColor: 'divider',
        borderRadius: 1,
        p: 1,
      }}
    >
      <Stack spacing={1}>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <TextField
            fullWidth
            label="Label"
            onBlur={commitLabel}
            onChange={(event) => setLabelDraft(event.target.value)}
            size="small"
            value={labelDraft}
          />
          <IconButton aria-label={`Remove ${thresholdName}`} onClick={() => onRemove(threshold.id)} size="small">
            <MaterialSymbol name="delete" />
          </IconButton>
        </Stack>

        <Stack direction="row" spacing={1}>
          <TextField
            fullWidth
            label="Axis"
            onChange={(event) => onUpdate(threshold.id, 'axis', event.target.value as Threshold['axis'])}
            select
            size="small"
            value={threshold.axis}
          >
            {thresholdAxisOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            fullWidth
            label="Value"
            onBlur={commitValue}
            onChange={(event) => setValueDraft(event.target.value)}
            size="small"
            type="number"
            value={valueDraft}
          />
        </Stack>

        <Stack
          direction="row"
          spacing={1}
          sx={{
            '& > *': {
              flex: 1,
              minWidth: 0,
            },
          }}
        >
          <TextField
            label="Style"
            onChange={(event) => onUpdate(threshold.id, 'style', event.target.value as Threshold['style'])}
            select
            size="small"
            value={threshold.style}
          >
            {thresholdStyleOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
          <ColorField
            label="Color"
            name={thresholdName}
            onChange={(value) => onUpdate(threshold.id, 'color', value)}
            value={threshold.color}
          />
        </Stack>
      </Stack>
    </Box>
  );
}

function getNextThresholdNumber(thresholds: Threshold[]) {
  const highestGeneratedId = thresholds.reduce((highestId, threshold) => {
    const match = /^threshold-(\d+)$/.exec(threshold.id);

    if (!match) {
      return highestId;
    }

    return Math.max(highestId, Number(match[1]));
  }, 0);

  return highestGeneratedId + 1;
}

function PlotConfigLoadingState() {
  return (
    <Stack aria-busy="true" aria-label="Loading plot configuration" role="status" spacing={1.25}>
      <PlotConfigSection title="">
        <Stack spacing={1}>
          <Skeleton animation="wave" height={20} variant="text" width={50} />
          <Skeleton animation="wave" height={40} variant="rounded" />
          <Skeleton animation="wave" height={40} variant="rounded" />
        </Stack>
      </PlotConfigSection>

      <PlotConfigSection title="">
        <Stack spacing={1.5}>
          {Array.from({ length: 4 }, (_, index) => (
            <Box
              key={index}
              sx={{
                alignItems: 'center',
                display: 'flex',
                gap: 1.25,
                minHeight: 32,
              }}
            >
              <Skeleton animation="wave" height={20} variant="rounded" width={20} />
              <Skeleton animation="wave" height={18} variant="text" width="58%" />
            </Box>
          ))}

          <Box sx={{ pt: 0.5 }}>
            <Box
              sx={{
                alignItems: 'center',
                display: 'flex',
                justifyContent: 'space-between',
                mb: 0.5,
              }}
            >
              <Skeleton animation="wave" height={20} variant="text" width="42%" />
              <Skeleton animation="wave" height={18} variant="text" width={28} />
            </Box>
            <Skeleton animation="wave" height={32} variant="rounded" />
          </Box>

          <Skeleton animation="wave" height={40} variant="rounded" />
        </Stack>
      </PlotConfigSection>

      <PlotConfigSection title="">
        <Skeleton animation="wave" height={31} variant="rounded" />
      </PlotConfigSection>
    </Stack>
  );
}

export function PlotConfig() {
  const { isLoading, selectedProject, updateProject } = useProjects();

  if (isLoading) {
    return <PlotConfigLoadingState />;
  }

  if (!selectedProject) {
    return null;
  }

  return (
    <PlotConfigEditor
      config={selectedProject.plotConfig}
      key={selectedProject.id}
      onPersist={(config) => {
        void updateProject(selectedProject.id, { plotConfig: config });
      }}
    />
  );
}

function PlotConfigEditor({ config: initialConfig, onPersist }: PlotConfigEditorProps) {
  const nextThresholdId = useRef(getNextThresholdNumber(initialConfig.guides.thresholds));
  const [config, setConfig] = useState(initialConfig);

  const onChange = (updateConfig: UpdatePlotConfig) => {
    const nextConfig = updateConfig(config);

    setConfig(nextConfig);
    onPersist(nextConfig);
  };

  const updateAxis = (axis: keyof PlotConfigFormData['axes'], value: PlotAxis) => {
    onChange((currentConfiguration) => ({
      ...currentConfiguration,
      axes: {
        ...currentConfiguration.axes,
        [axis]: value,
      },
    }));
  };

  const updateAppearance = <TKey extends keyof PlotConfigFormData['appearance']>(
    key: TKey,
    value: PlotConfigFormData['appearance'][TKey],
  ) => {
    onChange((currentConfiguration) => ({
      ...currentConfiguration,
      appearance: {
        ...currentConfiguration.appearance,
        [key]: value,
      },
    }));
  };

  const addThreshold = () => {
    const thresholdNumber = nextThresholdId.current++;

    onChange((currentConfiguration) => ({
      ...currentConfiguration,
      guides: {
        ...currentConfiguration.guides,
        thresholds: [
          ...currentConfiguration.guides.thresholds,
          {
            id: `threshold-${thresholdNumber}`,
            axis: 'y',
            value: 0,
            color: '#8ea2ff',
            label: `Threshold ${thresholdNumber}`,
            style: 'solid',
          },
        ],
      },
    }));
  };

  const updateThreshold: UpdateThreshold = (id, key, value) => {
    onChange((currentConfiguration) => ({
      ...currentConfiguration,
      guides: {
        ...currentConfiguration.guides,
        thresholds: currentConfiguration.guides.thresholds.map((threshold) =>
          threshold.id === id
            ? {
                ...threshold,
                [key]: value,
              }
            : threshold,
        ),
      },
    }));
  };

  const removeThreshold = (id: string) => {
    onChange((currentConfiguration) => ({
      ...currentConfiguration,
      guides: {
        ...currentConfiguration.guides,
        thresholds: currentConfiguration.guides.thresholds.filter((threshold) => threshold.id !== id),
      },
    }));
  };

  return (
    <Stack spacing={1.25}>
      <PlotConfigSection title="Axes">
        <Stack spacing={2}>
          <SearchableDropdown
            label="X axis"
            onChange={(value) => updateAxis('x', value)}
            options={axisOptions}
            value={config.axes.x}
          />
          <SearchableDropdown
            label="Y axis"
            onChange={(value) => updateAxis('y', value)}
            options={axisOptions}
            value={config.axes.y}
          />
        </Stack>
      </PlotConfigSection>

      <PlotConfigSection title="Appearance">
        <Stack spacing={1.5}>
          <FormCheckbox
            isChecked={config.appearance.isSmoothLineEnabled}
            label="Smooth line"
            onChange={(isChecked) => updateAppearance('isSmoothLineEnabled', isChecked)}
          />

          <FormCheckbox
            isChecked={config.appearance.isAreaFillEnabled}
            label="Area fill"
            onChange={(isChecked) => updateAppearance('isAreaFillEnabled', isChecked)}
          />

          <FormCheckbox
            isChecked={config.appearance.isShowPointsEnabled}
            label="Show points"
            onChange={(isChecked) => updateAppearance('isShowPointsEnabled', isChecked)}
          />

          <FormCheckbox
            isChecked={config.appearance.isShowGridlinesEnabled}
            label="Show gridlines"
            onChange={(isChecked) => updateAppearance('isShowGridlinesEnabled', isChecked)}
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
                {config.appearance.lineWidth}px
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
              value={config.appearance.lineWidth}
              valueLabelDisplay="auto"
            />
          </Box>

          <SearchableDropdown
            label="Downsampling"
            onChange={(value) => updateAppearance('downsampling', value)}
            options={downsamplingOptions}
            value={config.appearance.downsampling}
          />
        </Stack>
      </PlotConfigSection>

      <PlotConfigSection title="Guides">
        <Stack spacing={1}>
          <Button
            fullWidth
            onClick={addThreshold}
            size="small"
            startIcon={<MaterialSymbol name="add" />}
            variant="outlined"
          >
            Add threshold
          </Button>

          {config.guides.thresholds.length === 0 ? (
            <Typography color="text.secondary" variant="body2"></Typography>
          ) : (
            <Stack spacing={1}>
              {config.guides.thresholds.map((threshold, index) => (
                <ThresholdEditor
                  index={index}
                  key={threshold.id}
                  onRemove={removeThreshold}
                  onUpdate={updateThreshold}
                  threshold={threshold}
                />
              ))}
            </Stack>
          )}
        </Stack>
      </PlotConfigSection>
    </Stack>
  );
}
