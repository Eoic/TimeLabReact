import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { SearchableDropdown } from './SearchableDropdown';

const options = [
  {
    label: 'Time',
    value: 'time',
  },
  {
    label: 'Amplitude',
    value: 'amplitude',
  },
] as const;

describe('SearchableDropdown', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('opens options without spreading the option key prop', async () => {
    const user = userEvent.setup();
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    render(<SearchableDropdown label="Axis" onChange={vi.fn()} options={options} value="time" />);

    await user.click(screen.getByRole('combobox', { name: 'Axis' }));

    expect(screen.getByRole('option', { name: 'Amplitude' })).toBeInTheDocument();
    expect(
      consoleError.mock.calls.some((call) => String(call[0]).includes('A props object containing a "key" prop')),
    ).toBe(false);
  });
});
