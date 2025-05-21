import React from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
}

export const PageHeader = ({ title, description }: PageHeaderProps) => {
  return (
    <div className="mb-6 md:mb-8"> {/* Adjusted bottom margin for mobile */}
      <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-primary">{title}</h1> {/* Responsive title size */}
      {description && (
        <p className="text-base md:text-lg text-muted-foreground mt-1 md:mt-2"> {/* Responsive description size and margin*/}
          {description}
        </p>
      )}
    </div>
  );
};

export default PageHeader;
