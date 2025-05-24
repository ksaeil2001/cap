import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-neutral-200 py-6 mt-10">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className="text-sm text-neutral-500">
              &copy; {new Date().getFullYear()} MealMaster. All rights reserved.
            </p>
          </div>
          <div className="flex space-x-6">
            <a href="#" className="text-sm text-neutral-600 hover:text-primary">
              Privacy Policy
            </a>
            <a href="#" className="text-sm text-neutral-600 hover:text-primary">
              Terms of Service
            </a>
            <a href="#" className="text-sm text-neutral-600 hover:text-primary">
              Contact
            </a>
          </div>
        </div>
        <div className="mt-4 text-xs text-center text-neutral-400">
          <p>This application provides personalized meal recommendations based on your inputs.</p>
          <p>It is not a substitute for professional nutritional or medical advice.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;