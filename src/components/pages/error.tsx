"use client";

import { useRouter } from "next/navigation";

import { Icons } from "~/components/icons";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";

const defaultErrorMessage =
  "We apologize, but something went wrong. Please try again or return to the previous page.";
const defaultErrorHeadline = "Error";

export default function ErrorPage({
  headline,
  message,
}: {
  headline?: string;
  message?: string;
}) {
  const router = useRouter();

  return (
    <div className="flex h-full items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icons.alert className="text-destructive h-6 w-6" />
            <span>{headline ?? defaultErrorHeadline}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            {message ?? defaultErrorMessage}
          </p>
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <Button variant="outline" onClick={() => router.back()}>
            <Icons.arrowLeft className="h-4 w-4" />
            Go to Previous Page
          </Button>
          <Button variant={"outline"} onClick={() => router.push("/")}>
            <Icons.home className="h-4 w-4" />
            Go to Home Page
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
