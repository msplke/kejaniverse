"use client";

import { useRouter } from "next/navigation";
import { AlertCircle, ArrowLeft } from "lucide-react";

import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";

export default function ErrorPage() {
  const router = useRouter();

  return (
    <div className="flex h-full items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="text-destructive h-6 w-6" />
            <span>Error Occurred</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            We apologize, but something went wrong. Please try again or return
            to the previous page.
          </p>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </Button>
          <Button onClick={() => router.push("/")}>Return Home</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
