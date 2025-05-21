
import { ReactNode, useEffect, useState } from "react";
import { AppSidebar } from "./AppSidebar";
import { Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils"; // Import cn for conditional classes

interface AppLayoutProps {
  children: ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Check system preference on initial load
  useEffect(() => {
    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setIsDarkMode(isDark);
    
    if (isDark) {
      document.documentElement.classList.add('dark');
    }
    // Default to collapsed on small screens
    if (window.innerWidth < 1024) {
      setIsSidebarCollapsed(true);
    }

  }, []);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  return (
    <div className="h-screen bg-background dark:bg-gray-900 flex overflow-hidden transition-colors duration-300">
      <AppSidebar 
        collapsed={isSidebarCollapsed}
        toggleSidebar={toggleSidebar}
      />
      
      <main 
        className={cn(
          "flex-1 overflow-auto p-4 lg:p-8 transition-all duration-300",
          // Apply margin based on sidebar state for screens smaller than lg
          // On lg screens, the sidebar is always 64, so main content always has ml-64
          // When sidebar is open on smaller screens, push content
          // When sidebar is collapsed on smaller screens, push content by collapsed width
          isSidebarCollapsed ? "lg:ml-16 ml-16" : "lg:ml-64 ml-64", 
        )}
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-end mb-6">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleDarkMode}
              className="rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              <span className="sr-only">Toggle dark mode</span>
            </Button>
          </div>
          
          {children}
        </div>
      </main>
    </div>
  );
};

export default AppLayout;
