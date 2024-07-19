'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';

interface Article {
  name: string;
  author: string;
  title: string;
  description: string;
  url: string;
  urlToImage: string;
  publishedAt: string;
}

export default function Home() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [readArticles, setReadArticles] = useState<Article[]>([]);
  const [page, setPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    fetchNews();
    const savedArticles = JSON.parse(localStorage.getItem('readArticles') || '[]') as Article[];
    setReadArticles(savedArticles);
  }, []);

  const fetchNews = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`https://newsapi.org/v2/top-headlines?country=us&apiKey=7fa7653b5b4c417ca87787173ce924b2`);
      setArticles(response.data.articles.slice(0, 30));
      setTotalResults(response.data.totalResults);
    } catch (error) {
      console.error('Error fetching news', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`https://newsapi.org/v2/everything?q=${searchTerm}&page=${page}&pageSize=30&apiKey=7fa7653b5b4c417ca87787173ce924b2`);
      setArticles(response.data.articles);
      setTotalResults(response.data.totalResults);
    } catch (error) {
      console.error('Error searching news', error);
    } finally {
      setLoading(false);
    }
  };

  const saveReadArticle = (article: Article) => {
    const updatedReadArticles = [...readArticles, article];
    localStorage.setItem('readArticles', JSON.stringify(updatedReadArticles));
    setReadArticles(updatedReadArticles);
  };

  const deleteReadArticle = (index: number) => {
    const updatedReadArticles = readArticles.filter((_, i) => i !== index);
    localStorage.setItem('readArticles', JSON.stringify(updatedReadArticles));
    setReadArticles(updatedReadArticles);
  };

  const handleArticleClick = (article: Article) => {
    saveReadArticle(article);
    window.open(article.url, '_blank');
  };

  const formatPublishedAt = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'short',
      day: 'numeric',
      month: 'long',
      hour: '2-digit',
      minute: '2-digit',
    };
    return new Date(dateString).toLocaleDateString('id-ID', options);
  };

  const handleNextPage = () => {
    setPage(page + 1);
    handleSearch();
  };

  const handlePreviousPage = () => {
    if (page > 1) {
      setPage(page - 1);
      handleSearch();
    }
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <div className={`bg-gray-200 border-x-4 mx-auto p-4 min-h-screen ${isDarkMode ? 'dark' : ''}`}>
      <div className=' '>
      <div className="flex mb-4 justify-between items-center">
        <button
          className="p-2 border rounded bg-gray-500 text-white"
          onClick={toggleDarkMode}
        >
          {isDarkMode ? 'Light Mode' : 'Dark Mode'}
        </button>
        <div className="flex">
          <input
            className="flex-grow p-2 border rounded-l text-black"
            type="text"
            placeholder="Search News"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button
            className="p-2 border rounded-r bg-blue-500 text-white"
            onClick={handleSearch}
          >
            Search
          </button>
        </div>
      </div>
      </div>
      <h1 className="text-2xl font-bold mb-4">Berita</h1>
      <div className="grid grid-cols-12 gap-4">
        {loading ? (
          [1, 2, 3, 4, 5, 6, 7, 8, 9].map((index) => (
            <div key={index} className="col-span-6 md:col-span-4 lg:col-span-3 bg-gray-200 p-4 rounded animate-pulse">
              <div className="h-48 bg-gray-300 mb-4"></div>
              <div className="h-4 bg-gray-300 mb-2"></div>
              <div className="h-4 bg-gray-300"></div>
            </div>
          ))
        ) : (
          articles.map((article, index) => (
            <div
              key={index}
              className={`${
                index === 0
                  ? 'col-span-12 md:col-span-8 lg:col-span-6 row-span-2'
                  : 'col-span-6 md:col-span-4 lg:col-span-3'
              } bg-white dark:bg-gray-800 dark:text-white p-4 rounded shadow cursor-pointer hover:shadow-lg transition-shadow duration-200`}
              onClick={() => handleArticleClick(article)}
            >
              {article.urlToImage && (
                <img className="h-48 w-full object-cover rounded mb-4" src={article.urlToImage} alt={article.title} />
              )}
              <h2 className="text-xl font-bold">{article.title}</h2>
              <p className="text-gray-600 dark:text-gray-300">{article.author} - {formatPublishedAt(article.publishedAt)}</p>
              <p className="mt-2">{article.description}</p>
            </div>
          ))
        )}
      </div>
      <div className="flex justify-center mt-4 space-x-4">
        {page > 1 && (
          <button className="p-2 bg-blue-500 text-white rounded" onClick={handlePreviousPage}>
            Back Page
          </button>
        )}
        {totalResults > page * 30 && (
          <button className="p-2 bg-blue-500 text-white rounded" onClick={handleNextPage}>
            Next Page
          </button>
        )}
      </div>
      <h1 className="text-2xl font-bold mt-8 mb-4">Berita yang Pernah Dibaca</h1>
      <div className="grid grid-cols-12 gap-4">
        {readArticles.map((article, index) => (
          <div key={index} className="relative col-span-6 md:col-span-4 lg:col-span-3 bg-white dark:bg-gray-800 dark:text-white p-4 rounded shadow hover:shadow-lg transition-shadow duration-200">
            <button
              className="absolute top-2 right-2 p-1 text-white bg-red-500 rounded-full focus:outline-none"
              onClick={() => deleteReadArticle(index)}
            >
              &times;
            </button>
            {article.urlToImage && (
              <img className="h-48 w-full object-cover rounded mb-4" src={article.urlToImage} alt={article.title} />
            )}
            <h2 className="text-xl font-bold">{article.title}</h2>
            <a href={article.url} className="text-blue-500 break-all" target="_blank" rel="noopener noreferrer">{article.url}</a>
          </div>
        ))}
      </div>
    </div>
  );
}
