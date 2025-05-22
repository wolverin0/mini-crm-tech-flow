import * as React from "react";
import { cn } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface DetailItem {
  label: string;
  value: React.ReactNode;
}

interface FullScreenCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  details: DetailItem[];
  onClick?: () => void;
}

const FullScreenCard = React.forwardRef<HTMLDivElement, FullScreenCardProps>(
  ({ className, title, details, onClick, ...props }, ref) => {
    return (
      <Card
        ref={ref}
        className={cn("w-full shadow-md hover:shadow-lg transition-shadow duration-200 ease-in-out", onClick ? "cursor-pointer" : "", className)}
        onClick={onClick}
        {...props}
      >
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {details.map((item, index) => (
              <li key={index} className="flex flex-col sm:flex-row sm:justify-between">
                <span className="font-semibold text-sm text-muted-foreground">{item.label}:</span>
                <span className="text-sm">{item.value}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    );
  }
);
FullScreenCard.displayName = "FullScreenCard";

export { FullScreenCard, type DetailItem };
