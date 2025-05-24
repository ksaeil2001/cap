const Footer = () => {
  return (
    <footer className="bg-neutral-800 text-neutral-300 py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <div className="flex items-center">
              <i className="ri-restaurant-2-fill text-primary text-2xl mr-2"></i>
              <span className="text-xl font-heading font-semibold text-white">NutriPlan</span>
            </div>
            <p className="text-sm mt-2">Personalized nutrition made simple</p>
          </div>
          
          <div className="flex space-x-6">
            <a href="#" className="hover:text-white transition-colors duration-200">
              <i className="ri-github-fill text-xl"></i>
            </a>
            <a href="#" className="hover:text-white transition-colors duration-200">
              <i className="ri-twitter-fill text-xl"></i>
            </a>
            <a href="#" className="hover:text-white transition-colors duration-200">
              <i className="ri-instagram-line text-xl"></i>
            </a>
          </div>
        </div>
        
        <div className="border-t border-neutral-700 mt-6 pt-6 text-sm text-neutral-400 text-center">
          <p>&copy; {new Date().getFullYear()} NutriPlan. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
