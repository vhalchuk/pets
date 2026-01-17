/// <reference types="vitest/globals" />

import type { AnchorHTMLAttributes, ReactNode } from 'react';
import { render, screen } from '@testing-library/react';
import { SPRPage } from '../routes/SPRPage';

vi.mock('@tanstack/react-router', () => ({
  Link: ({
    children,
    ...props
  }: { children: ReactNode } & AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a {...props}>{children}</a>
  ),
}));

describe('SPRPage', () => {
  it('renders the main UI', () => {
    render(<SPRPage />);
    expect(
      screen.getByText('SPR: Speed Reading Presenter')
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Text')).toBeInTheDocument();
    expect(screen.getByText('Reader Stage')).toBeInTheDocument();
  });
});
