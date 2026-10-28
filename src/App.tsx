import { lazy } from 'react';
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';
import { FavoritesProvider } from '@/context/FavoritesContext';
import { Layout } from '@/components/layout/Layout';
import HomePage from '@/pages/HomePage';

// Home is the landing route and stays in the main bundle; everything else splits.
const AboutOverviewPage = lazy(() => import('@/pages/AboutOverviewPage'));
const MissionVisionPage = lazy(() => import('@/pages/MissionVisionPage'));
const ArtworksPage = lazy(() => import('@/pages/ArtworksPage'));
const CategoryPage = lazy(() => import('@/pages/CategoryPage'));
const NewsPage = lazy(() => import('@/pages/NewsPage'));
const NewsPostPage = lazy(() => import('@/pages/NewsPostPage'));
const ContactPage = lazy(() => import('@/pages/ContactPage'));
const FavoritesPage = lazy(() => import('@/pages/FavoritesPage'));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'about', element: <Navigate to="/about/overview" replace /> },
      { path: 'about/overview', element: <AboutOverviewPage /> },
      { path: 'about/mission-vision', element: <MissionVisionPage /> },
      { path: 'artworks', element: <ArtworksPage /> },
      { path: 'artworks/:category', element: <CategoryPage /> },
      { path: 'news', element: <NewsPage /> },
      { path: 'news/:slug', element: <NewsPostPage /> },
      { path: 'contact', element: <ContactPage /> },
      { path: 'favorites', element: <FavoritesPage /> },
      // Older URLs from the single-page version.
      { path: 'gallery', element: <Navigate to="/artworks" replace /> },
      { path: 'collections/*', element: <Navigate to="/artworks" replace /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);

export function App() {
  return (
    <FavoritesProvider>
      <RouterProvider router={router} />
    </FavoritesProvider>
  );
}
