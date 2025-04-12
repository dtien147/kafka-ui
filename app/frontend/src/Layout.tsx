import React from 'react';
import { Link } from 'react-router-dom';

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 text-gray-800">
      {/* Sticky Nav */}
      <header className="sticky top-0 z-50 bg-gray-900 text-white shadow">
        <nav className="container mx-auto px-4 py-3 flex gap-6 items-center">
          <Link to="/" className="hover:text-blue-300 font-semibold">Topics</Link>
          <Link to="/schemas" className="hover:text-blue-300 font-semibold">Schemas</Link>
          <Link to="/groups" className="hover:text-blue-300 font-semibold">Consumer Groups</Link>
          <Link to="/producer" className="hover:text-blue-300 font-semibold">Avro Producer</Link>
          <Link to="/avro" className="hover:text-blue-300 font-semibold">Avro Manageer</Link>
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-grow container mx-auto px-4 py-6">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white text-center text-sm py-3">
        Kafka UI &copy; {new Date().getFullYear()} — Powered by React, Tailwind, and KafkaJS
      </footer>
    </div>
  );
};

export default Layout;
