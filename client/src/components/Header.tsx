import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useLocation } from 'react-router-dom';

const Header: React.FC = () => {
  const location = useLocation();
  
  // Progress steps for the navigation
  const steps = [
    { path: '/', label: 'Profile' },
    { path: '/recommend', label: 'Recommend' },
    { path: '/meal-config', label: 'Configure' },
    { path: '/summary', label: 'Summary' },
  ];
  
  // Determine current step
  const currentStepIndex = steps.findIndex(step => step.path === location.pathname);
  
  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <h1 className="text-2xl font-bold text-primary">MealMaster</h1>
          </Link>
          
          {/* Navigation Steps */}
          <div className="hidden md:flex items-center space-x-1">
            {steps.map((step, index) => {
              // Determine if step is active, completed, or upcoming
              const isActive = index === currentStepIndex;
              const isCompleted = index < currentStepIndex;
              const isDisabled = index > currentStepIndex + 1; // Allow one step ahead
              
              return (
                <div key={step.path} className="flex items-center">
                  {/* Step circle */}
                  <Link to={isDisabled ? '#' : step.path}>
                    <div 
                      className={`
                        flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium
                        ${isActive ? 'bg-primary text-white' : 
                          isCompleted ? 'bg-primary-100 text-primary border border-primary' : 
                          'bg-neutral-100 text-neutral-400 border border-neutral-200'}
                        ${isDisabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
                      `}
                    >
                      {index + 1}
                    </div>
                  </Link>
                  
                  {/* Step label */}
                  <span 
                    className={`
                      text-sm ml-1
                      ${isActive ? 'text-primary font-medium' : 
                        isCompleted ? 'text-neutral-700' : 
                        'text-neutral-400'}
                    `}
                  >
                    {step.label}
                  </span>
                  
                  {/* Connector line (not after the last item) */}
                  {index < steps.length - 1 && (
                    <div 
                      className={`
                        w-8 h-px mx-1
                        ${index < currentStepIndex ? 'bg-primary' : 'bg-neutral-200'}
                      `}
                    />
                  )}
                </div>
              );
            })}
          </div>
          
          {/* Mobile: Simple Step Indicator */}
          <div className="md:hidden">
            <span className="text-sm text-neutral-600">
              Step {currentStepIndex + 1} of {steps.length}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;