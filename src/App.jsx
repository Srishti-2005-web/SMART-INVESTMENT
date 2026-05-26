import './styles/globals.css';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import PastDataAnalysis from './components/PastDataAnalysis';
import FactorsAnalysis from './components/FactorsAnalysis';
import PricePrediction from './components/PricePrediction';
import SIPCalculator from './components/SIPCalculator';
import Footer from './components/Footer';

export default function App() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <PastDataAnalysis />
        <FactorsAnalysis />
        <PricePrediction />
        <SIPCalculator />
      </main>
      <Footer />
    </>
  );
}
