import { Button } from "~/components/ui/button";

interface FilterActionsProps {
  onReset: () => void;
  onApply: () => void;
}

export function FilterActions({ onReset, onApply }: FilterActionsProps) {
  return (
    <div className="flex justify-between">
      <Button variant="secondary" onClick={onReset}>
        Reset all
      </Button>
      <Button onClick={onApply}>Apply now</Button>
    </div>
  );
}
