import { useParams, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Spinner from './Spinner';

const API_BASE_URL = 'https://api.themoviedb.org/3';
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const API_OPTIONS = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: `Bearer ${API_KEY}`
  }
};

const getRuntime = (minutes) => {
    const hrs = Math.floor(minutes / 60); 
    const mins = minutes % 60;
    return `${hrs}h ${mins}m`;
};

const getReleaseDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options); 
};

const getBudget = (amount) => {
  if (!amount) return 'N/A';
  if (amount >= 1_000_000_000) {
    return `$${(amount / 1_000_000_000).toFixed(2)} Billion`;
  } else if (amount >= 1_000_000) {
    return `$${(amount / 1_000_000).toFixed(2)} Million`;
  } else {
    return `$${amount.toLocaleString()}`;
  }
};

const MovieDetail = ({trendingMovies}) => {
  const { id } = useParams();
  const rank = trendingMovies.findIndex(movie => movie.id === id) + 1;
  const [movie, setMovie] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    setError('');
    setMovie(null);
    fetch(`${API_BASE_URL}/movie/${id}`, API_OPTIONS)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch movie details');
        return res.json();
      })
      .then(data => setMovie(data))
      .catch(() => setError('Could not load movie details.'));
  }, [id]);

  if (error) return (
    <div className="movie-detail p-8">
      <p className="text-red-500 mb-4">{error}</p>
      <Link to="/" className="text-blue-500 underline">Back to Home</Link>
    </div>
  );

  if (!movie) return <div className="movie-detail p-8"><Spinner/></div>;

  console.log(movie);

  return (
    <div className="movie-detail p-8 max-w-7xl mx-auto bg-dark-100 rounded-2xl shadow-lg mt-10">
      <div className="flex-col md:flex-row gap-8">
        <div className="flex md:flex-row items-center justify-between mb-6"> 
            <div className='flex-col'> 
                <h2 className="text-3xl font-bold mb-2">{movie.title}</h2>
                <p className='year'>{movie.release_date ? movie.release_date.split('-')[0] : 'N/A'} <span className='ml-1 mr-1'>•</span> {movie.adult ? "R-rated" : "PG-13"} <span className='ml-1 mr-1'>•</span> {movie.runtime ? getRuntime(movie.runtime) : "N/A"} </p>
            </div>
            <div className='flex gap-3 mb-5'>
                <div className='rating bg-light-100/10 p-2.5 rounded-lg flex items-center'>
                    <img src="/star.svg" alt="rating" />
                    <p className="">{movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A'}<span>/10 <span>({movie.vote_count})</span></span></p>
                </div>
                <div className='rating bg-light-100/10 p-2.5 rounded-lg flex items-center'>
                    <img src="/trending.svg" alt="rating" />
                    <span>{rank}</span>
                </div>
            </div>
        </div>
    <div className='flex mb-6 gap-2'>
      <img 
        src={movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : "/no-movie.png"} 
        alt={movie.title} 
        className="w-64 h-96 rounded-lg shadow-lg mx-auto md:mx-0 object-cover"
      />
      <div
        className="w-full h-96 rounded-lg shadow-lg mx-auto md:mx-0 overflow-hidden bg-center bg-cover"
        style={{
          backgroundImage: movie.backdrop_path
          ? `url(https://image.tmdb.org/t/p/w780${movie.backdrop_path})`
          : 'none'
        }}
      />
    </div>
        <table className="w-full border-collapse">
          <tbody>
            <tr>
              <td className="info-title">Genres</td>
              <td className='movie-info'>
                <div className="flex flex-wrap gap-2 items-center">
                    {movie.genres && movie.genres.length > 0 ? movie.genres.map(genre => (
                        <span 
                        key={genre.id} 
                        className="bg-light-100/10 px-3 py-1.5 rounded text-sm"
                        >
                        {genre.name}
                        </span>
                    )) : 'N/A'}
                </div>
              </td>
              <td className='movie-info w-45 border-r-0'>
                <div className='flex align-center justify-end'>
                    <a
                        href={movie.homepage}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-dark-100 bg-light-100 rounded inline-flex items-center font-bold text-sm px-3 py-1.5 hover:bg-light-200 transition flex-wrap"
                        >
                        Visit Homepage
                        <img
                            src="/arrow.svg"
                            alt="right arrow"
                            className="ml-2 w-4 h-4 inline"
                            style={{ display: 'inline' }}
                        />
                    </a>
                </div>
              </td>
            </tr>
            <tr>
              <td className="info-title">Overview</td>
              <td className='movie-info'><p>{movie.overview}</p></td>
            </tr>
            <tr>
              <td className="info-title">Release Date</td>
              <td className='movie-info'><p>{movie.release_date ? getReleaseDate(movie.release_date) : "N/A"}</p></td>
            </tr>
            <tr>
              <td className="info-title">Countries</td>
              <td className='movie-info'>
                {movie.production_countries && movie.production_countries.length > 0 ? movie.production_countries.map(country => (
                <p
                    key={country.iso_3166_1}
                >
                    {country.name} {movie.production_countries.length > 1 ? <span>•</span> : ''}
                </p>
                )) : 'N/A'}
              </td>
            </tr>
            <tr>
              <td className="info-title">Status</td>
              <td className='movie-info'>{movie.status}</td>
            </tr>
            <tr>
              <td className="info-title">Languages</td>
              <td className='movie-info'>
                {movie.spoken_languages && movie.spoken_languages.length > 0 ? movie.spoken_languages.map(language => (
                <p
                    key={language.iso_3166_1}
                >
                    {language.name} {movie.spoken_languages.length > 1 ? <span>•</span> : ''}
                </p>
                )) : 'N/A'}
              </td>
            </tr>
            <tr>
              <td className="info-title">Budget</td>
              <td className='movie-info'>{movie.budget ? getBudget(movie.budget) : "N/A"}</td>
            </tr>
            <tr>
              <td className="info-title">Revenue</td>
              <td className='movie-info'>{movie.revenue ? getBudget(movie.revenue) : "N/A"}</td>
            </tr>
            <tr>
              <td className="info-title">Tagline</td>
              <td className='movie-info'>{movie.tagline}</td>
            </tr>
            <tr>
              <td className="info-title">Production Companies</td>
              <td className='movie-info'>
                <div className='flex flex-wrap gap-2'>
                    {movie.production_companies && movie.production_companies.length > 0 ? movie.production_companies.map((company, idx) => (
                    <p key={company.id || idx}>
                        {company.name} {idx < movie.production_companies.length - 1 ? <span className='ml-1'>•</span> : ''}
                    </p>
                    )) : 'N/A'}
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MovieDetail;