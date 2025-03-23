import Link from "next/link";
import { PlusCircle } from "lucide-react";

import { Card, CardContent } from "~/components/ui/card";

export default function Page() {
  return (
    <main>
      <h1 className="text-2xl">Properties</h1>
      <div className="mt-4 flex">
        <Link href={"/properties/new"}>
          <Card className="w-2xs">
            <CardContent>
              <div className="flex flex-col items-center gap-2">
                <p>Create new property</p>
                <PlusCircle color="gray" />
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </main>
  );
}
