"use client";

import { useRouter } from "next/navigation";
import { TooltipTrigger } from "@radix-ui/react-tooltip";
import { ArrowLeft } from "lucide-react";

import { Button } from "~/components/ui/button";
import { Tooltip, TooltipContent } from "~/components/ui/tooltip";

export function BackButton() {
  const router = useRouter();

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="link"
          onClick={() => router.back()}
          className="cursor-pointer"
        >
          <ArrowLeft size={32} />
          <span className="sr-only">Back</span>
        </Button>
      </TooltipTrigger>
      <TooltipContent>Go back</TooltipContent>
    </Tooltip>
  );
}
