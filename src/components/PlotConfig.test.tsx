import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { PlotConfig } from './PlotConfig';

describe('PlotConfig', () => {
  it('adds, edits, and removes threshold rows inline', async () => {
    const user = userEvent.setup();

    render(<PlotConfig />);

    await user.click(screen.getByRole('button', { name: 'Add threshold' }));

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
});
