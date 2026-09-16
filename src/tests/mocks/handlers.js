import { http, HttpResponse } from 'msw';

export const handlers = [
  // Trending movies
  http.get('https://api.themoviedb.org/3/trending/movie/day', () => {
    return HttpResponse.json({
      page: 1,
      results: [
        {
          id: 693134,
          title: 'Dune: Part Two',
          overview: 'Paul Atreides unites with Chani and the Fremen while seeking revenge.',
          poster_path: '/8b8R8l88Qje9dn9OE8PY05Nxl1X.jpg',
          backdrop_path: '/xOMo8BRK7PfcJv9JCnx7s520b8.jpg',
          vote_average: 8.3,
          vote_count: 4200,
          release_date: '2024-02-27',
          media_type: 'movie',
        },
        {
          id: 1011985,
          title: 'Kung Fu Panda 4',
          overview: 'Po must train a new dragon warrior.',
          poster_path: '/kDp1vUBnMpe8ak4rjgl3cLELqjU.jpg',
          backdrop_path: '/1XDDXPXGiI8id7MrUxK36ke7gkX.jpg',
          vote_average: 7.1,
          vote_count: 1800,
          release_date: '2024-03-02',
          media_type: 'movie',
        },
      ],
      total_pages: 10,
      total_results: 200,
    });
  }),

  // Now playing in theaters
  http.get('https://api.themoviedb.org/3/movie/now_playing', () => {
    return HttpResponse.json({
      page: 1,
      results: [
        {
          id: 693134,
          title: 'Dune: Part Two',
          poster_path: '/8b8R8l88Qje9dn9OE8PY05Nxl1X.jpg',
          vote_average: 8.3,
          release_date: '2024-02-27',
        },
      ],
      total_pages: 5,
      total_results: 100,
    });
  }),

  // Movie details
  http.get('https://api.themoviedb.org/3/movie/:id', ({ params }) => {
    return HttpResponse.json({
      id: Number(params.id),
      title: 'Dune: Part Two',
      tagline: 'Long live the fighters.',
      overview: 'Paul Atreides unites with Chani and the Fremen.',
      poster_path: '/8b8R8l88Qje9dn9OE8PY05Nxl1X.jpg',
      backdrop_path: '/xOMo8BRK7PfcJv9JCnx7s520b8.jpg',
      vote_average: 8.3,
      vote_count: 4200,
      runtime: 166,
      release_date: '2024-02-27',
      genres: [
        { id: 878, name: 'Science Fiction' },
        { id: 12, name: 'Adventure' },
      ],
      credits: {
        cast: [
          { id: 1190668, name: 'Timothée Chalamet', character: 'Paul Atreides', profile_path: null },
          { id: 505710, name: 'Zendaya', character: 'Chani', profile_path: null },
        ],
      },
      videos: {
        results: [
          { key: 'Way9Dexny3w', name: 'Official Trailer', site: 'YouTube', type: 'Trailer' },
        ],
      },
      similar: { results: [] },
    });
  }),

  // Movie videos
  http.get('https://api.themoviedb.org/3/movie/:id/videos', () => {
    return HttpResponse.json({
      id: 693134,
      results: [
        { key: 'Way9Dexny3w', name: 'Official Trailer', site: 'YouTube', type: 'Trailer' },
      ],
    });
  }),
];
