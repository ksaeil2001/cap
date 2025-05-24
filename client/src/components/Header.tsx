import { Link } from "react-router-dom";

const Header = () => {
  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="flex items-center">
          <i className="ri-restaurant-2-fill text-primary text-3xl mr-2"></i>
          <h1 className="text-2xl font-heading font-bold text-neutral-800">NutriPlan</h1>
        </Link>
        <nav>
          <button className="hidden md:block text-neutral-600 hover:text-primary transition-colors duration-200">
            <i className="ri-question-line mr-1"></i>
            Help
          </button>
        </nav>
      </div>
    </header>
  );
};

export default Header;
