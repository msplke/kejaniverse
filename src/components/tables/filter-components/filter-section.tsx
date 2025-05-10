import type { ReactNode } from "react";

import { Button } from "~/components/ui/button";

interface FilterSectionProps {
  title: string;
  children: ReactNode;
  onReset?: () => void;
}

export function FilterSection({
  title,
  children,
  onReset,
}: FilterSectionProps) {
  return (
    <div className="space-y-2 border-b pb-4">
      <div className="flex items-center justify-between">
        <h4 className="font-medium">{title}</h4>
        <Button variant="ghost" size={"sm"} onClick={onReset}>
          Reset
        </Button>
      </div>
      {children}
    </div>
  );
}
