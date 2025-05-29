import { Route, Routes } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import MainInputPage from "@/pages/MainInputPage";
import RecommendPage from "@/pages/RecommendPage";
import MealConfigPage from "@/pages/MealConfigPage";
import SummaryPage from "@/pages/SummaryPage";
import Header from "@/components/Header";

function Router() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-6">
        <Routes>
          <Route path="/" element={<MainInputPage />} />
          <Route path="/recommend" element={<RecommendPage />} />
          <Route path="/meal-config" element={<MealConfigPage />} />
          <Route path="/summary" element={<SummaryPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
