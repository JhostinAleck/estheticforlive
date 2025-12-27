import { Routes, Route } from 'react-router-dom';
import ScrollToTop from './components/ui/ScrollToTop';
import HomePage from './pages/HomePage';
import ServicesPage from './pages/ServicesPage';

function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/servicios" element={<ServicesPage />} />
      </Routes>
    </>
  );
}

export default App;
