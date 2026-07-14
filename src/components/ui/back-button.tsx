"use client";

import { useRouter } from "next/navigation";

import { Icons } from "~/components/icons";
import { Button } from "~/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~/components/ui/tooltip";

export function BackButton() {
  const router = useRouter();

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            variant="link"
            onClick={() => router.back()}
            className="cursor-pointer"
          />
        }
      >
        <Icons.arrowLeft size={32} />
        <span className="sr-only">Back</span>
      </TooltipTrigger>
      <TooltipContent>Go back</TooltipContent>
    </Tooltip>
  );
}
