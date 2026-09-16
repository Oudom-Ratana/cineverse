import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from '../redux/store';
import { AuthProvider } from '../context/AuthContext';
import MovieCard from '../components/movie/MovieCard';

const mockMovie = {
  id: 693134,
  title: 'Dune: Part Two',
  poster_path: '/8b8R8l88Qje9dn9OE8PY05Nxl1X.jpg',
  vote_average: 8.3,
  release_date: '2024-02-27',
};

describe('MovieCard Component', () => {
  it('renders movie title, year, and TMDB rating properly', () => {
    render(
      <Provider store={store}>
        <AuthProvider>
          <BrowserRouter>
            <MovieCard item={mockMovie} mediaType="movie" />
          </BrowserRouter>
        </AuthProvider>
      </Provider>
    );

    // Title check
    expect(screen.getByText('Dune: Part Two')).toBeInTheDocument();

    // Year check
    expect(screen.getByText('2024')).toBeInTheDocument();

    // Rating check
    expect(screen.getByText('8.3')).toBeInTheDocument();

    // Action buttons check
    expect(screen.getByText('Book Cinema Seats')).toBeInTheDocument();
    expect(screen.getByText('Watch Trailer')).toBeInTheDocument();
  });
});
