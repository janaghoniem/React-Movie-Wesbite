import { useState, useEffect } from 'react'
import movieLogo from '/logo (1).png'
import Search from './components/Search.jsx'
import './App.css'
import Spinner from './components/Spinner.jsx'
import MovieCard from './components/MovieCard.jsx'
import { updateSearchCount, getTrendingMovies } from './appwrite.js'

//API
const API_BASE_URL = 'https://api.themoviedb.org/3'
const API_KEY = import.meta.env.VITE_TMDB_API_KEY
const API_OPTIONS = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: `Bearer ${API_KEY}`
  }
}

function App() {
  const [searchTerm, setSearchTerm] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [trendingErrorMessage, setTrendingErrorMessage] = useState('')
  const [movieList, setMovieList] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [bouncedSearchTerm, setBouncedSearchTerm] = useState("")
  const [trendingMovies, setTrendingMovies] = useState([])

  const fetchMovies = async () => {
    setIsLoading(true);
    setErrorMessage('');

    try {
      if(bouncedSearchTerm) {
        const endpoint = `${API_BASE_URL}/search/movie?query=${bouncedSearchTerm}`;
        const response = await fetch(endpoint, API_OPTIONS)
        
        if (!response.ok) {
          throw new Error();
        }
        const data = await response.json();
        console.log(data);

        if(data.response === 'False') {
          setErrorMessage(data.error);
          setMovieList([]);
          return
        }
        setMovieList(data.results);
        setErrorMessage('');
        updateSearchCount(bouncedSearchTerm, data.results[0]);
        return
      }

      const endpoint = `${API_BASE_URL}/discover/movie?sort-by=popularity.desc`;
      const response = await fetch(endpoint, API_OPTIONS)
      
      if (!response.ok) {
        throw new Error();
      }
      const data = await response.json();
      console.log(data);

      if(data.response === 'False') {
        setErrorMessage(data.error);
        setMovieList([]);
        return
      }
      setMovieList(data.results);
    } catch (error) {
      setErrorMessage('Error fetching movies. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  }

  const fetchTrendingMovies = async () => {
    try {
      const movies = await getTrendingMovies();
      setTrendingMovies(movies);
      setTrendingErrorMessage('');
      console.log(movies);
    } catch (error) {
      setTrendingErrorMessage('Error fetching trending movies. Please try again later.');
    }
  }
  
  useEffect(() => {
    fetchTrendingMovies();
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      setBouncedSearchTerm(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    fetchMovies();
  }, [bouncedSearchTerm])

  return (
    <main>
      <div className="pattern"/>

      <div className="wrapper"> 
        <header>
          <img src="./hero.png" alt="Hero Banner" />
          <h1>Find <span className='text-gradient'>Movies</span> You'll Enjoy Without the Hassle</h1>
          <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        </header>

        <section className='trending'>
          <h2>Trending</h2>
          {trendingErrorMessage ? (
            <p className="text-red-500">{trendingErrorMessage}</p>
          ) : (
          <ul>
            {trendingMovies.map((movie, index) => (
                <li key={movie.$id}>
                  <p>{index + 1}</p>
                  <img src={movie.poster_url} alt={movie.title} />
                </li>
              ))}
          </ul> )}
        </section>

        <section className='all-movies'>
          <h2 className='mt-10'>Popular</h2>
          {isLoading ? (<Spinner />) : errorMessage ? (
            <p className="text-red-500">{errorMessage}</p>
          ) : (<ul>
                {movieList.map((movie) => (
                  <MovieCard key={movie.id} movie={movie} />
                ))}
              </ul>)}
        </section>
        
      </div>
    </main>
  )
}

export default App
