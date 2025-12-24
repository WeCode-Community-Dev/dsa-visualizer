
import React from 'react';
import { Helmet } from 'react-helmet';

import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import DsaVisualization from '@/pages/DsaVisualization';
import ScrollToTop from '@/components/ScrollToTop';

function App() {
  return (
    <>
      {/* Global Font Preloading */}
      <Helmet>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,700&family=Inter:wght@400;500;700;900&display=swap"
          rel="stylesheet"
        />
      </Helmet>

      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow">
          <ScrollToTop />
          <DsaVisualization />
        </main>
        <Footer />
      </div>
    </>
  );
}

export default App;