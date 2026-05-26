import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { PlotConfig } from './PlotConfig';
import { ProjectManager } from './ProjectManager';
import type { PlotConfig as ProjectPlotConfig } from '../database/models/project';
import { createProject, getAllProjects, setSelectedProject, updateProject } from '../repository/projects';
import { unwrapOk } from '../shared/result';
import { renderWithProjects } from '../test/renderWithProjects';

const customPlotConfig: ProjectPlotConfig = {
  axes: {
    x: 'sampleIndex',
    y: 'amplitude',
  },
  appearance: {
    downsampling: 'average',
    isAreaFillEnabled: false,
    isShowGridlinesEnabled: false,
    isShowPointsEnabled: false,
    isSmoothLineEnabled: false,
    lineWidth: 4,
  },
  guides: {
    thresholds: [],
  },
};

describe('PlotConfig', () => {
  it('shows a loading state while project plot config is loading', () => {
    renderWithProjects(<PlotConfig />);

    const loadingState = screen.getByRole('status', { name: 'Loading plot configuration' });

    expect(loadingState).toHaveAttribute('aria-busy', 'true');
    expect(screen.queryByRole('button', { name: 'Add threshold' })).not.toBeInTheDocument();
  });

  it('adds, edits, and removes threshold rows inline', async () => {
    const user = userEvent.setup();

    renderWithProjects(<PlotConfig />);

    await user.click(await screen.findByRole('button', { name: 'Add threshold' }));

    const labelInput = screen.getByLabelText('Label');
    const valueInput = screen.getByLabelText('Value');

    expect(labelInput).toHaveValue('Threshold 1');
    expect(valueInput).toHaveValue(0);

    await user.clear(labelInput);
    await user.type(labelInput, 'Upper bound');
    await user.clear(valueInput);
    await user.type(valueInput, '42');

    expect(screen.getByDisplayValue('Upper bound')).toBeInTheDocument();
    expect(valueInput).toHaveValue(42);

    await user.click(screen.getByRole('button', { name: 'Remove Upper bound' }));

    expect(screen.queryByDisplayValue('Upper bound')).toBeNull();
  });

  it('reads plot config from the selected project', async () => {
    const project = unwrapOk(await createProject({ title: 'Stored config', description: '' }));
    unwrapOk(await updateProject(project.id, { plotConfig: customPlotConfig }));
    unwrapOk(await setSelectedProject(project.id));

    renderWithProjects(<PlotConfig />);

    expect(await screen.findByLabelText('X axis')).toHaveValue('Sample index');
    expect(screen.getByText('4px')).toBeInTheDocument();
    expect(screen.getByLabelText('Smooth line')).not.toBeChecked();
    expect(screen.getByLabelText('Show gridlines')).not.toBeChecked();
  });

  it('persists plot config changes to the selected project', async () => {
    const user = userEvent.setup();

    renderWithProjects(<PlotConfig />);

    await user.click(await screen.findByRole('button', { name: 'Add threshold' }));
    await user.clear(screen.getByLabelText('Label'));
    await user.type(screen.getByLabelText('Label'), 'Upper bound');
    await user.tab();

    await waitFor(async () => {
      const projects = unwrapOk(await getAllProjects());
      const project = projects.find((project) => project.isSelected);

      expect(project?.plotConfig.guides.thresholds).toHaveLength(1);
      expect(project?.plotConfig.guides.thresholds[0]).toMatchObject({
        axis: 'y',
        color: '#8ea2ff',
        label: 'Upper bound',
        style: 'solid',
        value: 0,
      });
    });
  });

  it('refreshes when the selected project changes elsewhere', async () => {
    const user = userEvent.setup();
    const firstProject = unwrapOk(await createProject({ title: 'Default config', description: '' }));
    const secondProject = unwrapOk(await createProject({ title: 'Stored config', description: '' }));

    unwrapOk(await updateProject(secondProject.id, { plotConfig: customPlotConfig }));
    unwrapOk(await setSelectedProject(firstProject.id));

    renderWithProjects(
      <>
        <ProjectManager />
        <PlotConfig />
      </>,
    );

    expect(await screen.findByLabelText('X axis')).toHaveValue('Time');

    await user.click(await screen.findByRole('button', { name: 'Default config' }));
    await user.click(screen.getByRole('menuitem', { name: 'Stored config' }));

    await waitFor(() => {
      expect(screen.getByLabelText('X axis')).toHaveValue('Sample index');
    });
  });
});
