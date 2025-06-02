const { createApp } = Vue;

createApp({
  data() {
    return {
      apiKey: '6c9c2669d3065c9fd5b3a21a6e768158',
      apiUrl: 'https://api.themoviedb.org/3',
      imageBase: 'https://image.tmdb.org/t/p/w500',
      movies: [],
      genres: [],
      selectedMovie: null,
      selectedGenre: '',
      searchQuery: '',
      sortOrder: 'asc', // Neu
      trailerUrl: null,
      page: 1
    };
  },
  mounted() {
    this.fetchGenres();
    this.fetchMovies();
  },
  watch: {
    searchQuery() {
      this.resetAndFetch();
    },
    selectedGenre() {
      this.resetAndFetch();
    },
    sortOrder() {
      this.sortMovies();
    }
  },
  methods: {
    resetAndFetch() {
      this.page = 1;
      this.movies = [];
      this.trailerUrl = null;
      this.fetchMovies();
    },
    async fetchGenres() {
      try {
        const res = await fetch(`${this.apiUrl}/genre/movie/list?api_key=${this.apiKey}&language=en-US`);
        const data = await res.json();
        this.genres = data.genres;
      } catch (err) {
        console.error('Error fetching genres:', err);
      }
    },
    async fetchMovies() {
      let endpoint = '';

      if (this.searchQuery.trim()) {
        endpoint = `/search/movie?api_key=${this.apiKey}&language=en-US&query=${this.searchQuery.trim()}&page=${this.page}`;
      } else if (this.selectedGenre) {
        endpoint = `/discover/movie?api_key=${this.apiKey}&language=en-US&with_genres=${this.selectedGenre}&page=${this.page}`;
      } else {
        endpoint = `/movie/popular?api_key=${this.apiKey}&language=en-US&page=${this.page}`;
      }

      try {
        const res = await fetch(this.apiUrl + endpoint);
        const data = await res.json();
        if (this.page === 1) {
          this.movies = data.results;
        } else {
         this.movies.push(...data.results);
        }
        this.sortMovies(); // sortieren nach jedem Fetch
      } catch (err) {
        console.error('Error fetching movies:', err);
      }
    },
    sortMovies() {
      this.movies.sort((a, b) => {
        const titleA = a.title?.toLowerCase() || '';
        const titleB = b.title?.toLowerCase() || '';
        if (this.sortOrder === 'asc') {
          return titleA.localeCompare(titleB);
        } else {
          return titleB.localeCompare(titleA);
        }
      });
    },
    loadMore() {
      this.page++;
      this.fetchMovies();
    },
    getImageUrl(path) {
      return path ? `${this.imageBase}${path}` : 'https://via.placeholder.com/500x750?text=No+Image';
    },
    async showDetails(movie) {
      this.selectedMovie = movie;
      this.trailerUrl = await this.fetchTrailer(movie.id);
    },
    async fetchTrailer(movieId) {
      try {
        const response = await fetch(`${this.apiUrl}/movie/${movieId}/videos?api_key=${this.apiKey}&language=en-US`);
        const data = await response.json();
        const trailer = data.results.find(video => video.type === 'Trailer' && video.site === 'YouTube');
        return trailer ? `https://www.youtube.com/embed/${trailer.key}` : null;
      } catch (err) {
        console.error('Error fetching trailer:', err);
        return null;
      }
    },
    genreNameById(id) {
      const genre = this.genres.find(g => g.id === id);
      return genre ? genre.name : '';
    }
  }
}).mount('body');
