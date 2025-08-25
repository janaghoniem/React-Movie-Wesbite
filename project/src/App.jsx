import { useState, useEffect } from 'react'
import { updateSearchCount, getTrendingMovies } from './appwrite.js'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css'

import Search from './components/Search.jsx'
import Spinner from './components/Spinner.jsx'
import Pages from './components/Pages.jsx'
import MovieCard from './components/MovieCard.jsx'
import MovieDetail from './components/MovieDetail.jsx'; 


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
  const [currentPage, setCurrentPage] = useState(1)

  const fetchMovies = async () => {
    setIsLoading(true);
    setErrorMessage('');

    try {
      if(bouncedSearchTerm) {
        const endpoint = `${API_BASE_URL}/search/movie?query=${bouncedSearchTerm}&page=${currentPage}`;
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

      const endpoint = `${API_BASE_URL}/discover/movie?sort-by=popularity.desc&page=${currentPage}`;
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
  }, [bouncedSearchTerm, currentPage]);

  return (
    <router>
    <main>
      <div className="pattern" />

      <div className="wrapper"> 
        <Router>
          <Routes>
              <Route path="/" element={
                <>
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
                          <MovieCard key={movie.id} movie={movie} onClick/>
                        ))}
                      </ul>)}
                </section>

                <section>
                  { <Pages 
                    currentPage={currentPage} 
                    totalPages={5} 
                    onPageChange={(page) => setCurrentPage(page)} /> }
                </section>
                </>
              }/>
              <Route path="/movie/:id" element={<MovieDetail trendingMovies = {trendingMovies} />} />
            </Routes>
          </Router>
      </div>
    </main>
    </router>
  )
}

export default App
