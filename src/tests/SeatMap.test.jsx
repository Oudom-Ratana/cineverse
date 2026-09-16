import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { store } from '../redux/store';
import { AuthProvider } from '../context/AuthContext';
import { WebSocketProvider } from '../context/WebSocketContext';
import SeatMap from '../components/booking/SeatMap';

const mockShowtime = {
  id: 'st_mock_1',
  hallId: 'hall-imax-1',
  hallName: 'Hall 1 — IMAX Laser Experience',
  format: 'IMAX 2D',
  basePrice: 18.00,
  vipPrice: 26.50,
};

describe('SeatMap Component', () => {
  it('renders auditorium information and interactive cinema seat elements', () => {
    const handleToggleSeat = vi.fn();

    render(
      <Provider store={store}>
        <AuthProvider>
          <WebSocketProvider>
            <SeatMap
              showtime={mockShowtime}
              selectedSeats={[]}
              onToggleSeat={handleToggleSeat}
            />
          </WebSocketProvider>
        </AuthProvider>
      </Provider>
    );

    // Verify hall name and screen are present
    expect(screen.getByText(/Hall 1 — IMAX Laser Experience/i)).toBeInTheDocument();
    expect(screen.getByText(/Curved Cinema Screen/i)).toBeInTheDocument();
    expect(screen.getByText(/Selected By You/i)).toBeInTheDocument();
    expect(screen.getByText(/VIP Recliner/i)).toBeInTheDocument();
  });

  it('triggers onToggleSeat callback when an available seat is clicked', () => {
    const handleToggleSeat = vi.fn();

    const { container } = render(
      <Provider store={store}>
        <AuthProvider>
          <WebSocketProvider>
            <SeatMap
              showtime={mockShowtime}
              selectedSeats={[]}
              onToggleSeat={handleToggleSeat}
            />
          </WebSocketProvider>
        </AuthProvider>
      </Provider>
    );

    // Find seat rects in SVG
    const seatGroups = container.querySelectorAll('g.hover\\:scale-110');
    expect(seatGroups.length).toBeGreaterThan(0);

    // Click the first seat (A-1)
    fireEvent.click(seatGroups[0]);
    expect(handleToggleSeat).toHaveBeenCalledTimes(1);
    expect(handleToggleSeat).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'A-1',
        row: 'A',
        col: 1,
      })
    );
  });
});
