import Layout from '../components/layout/Layout';
import Hero from '../components/home/Hero';
import ServicesGrid from '../components/home/ServicesGrid';
import ResultsCarousel from '../components/home/ResultsCarousel';
import SocialProof from '../components/home/SocialProof';
import SocialFeed from '../components/home/SocialFeed';

const HomePage = () => {
  return (
    <Layout>
      <Hero />
      <ServicesGrid />
      <ResultsCarousel />
      <SocialProof />
      <SocialFeed />
    </Layout>
  );
};

export default HomePage;
