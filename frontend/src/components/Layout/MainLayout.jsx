import React from 'react';
import Navbar from '../Common/Navbar';
import Footer from '../Common/Footer';

const MainLayout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-900 to-blue-900">
      <Navbar isAdmin={false} />
      <main className="flex-grow pt-16">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;