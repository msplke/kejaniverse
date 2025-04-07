import Link from "next/link";
import { PlusCircle } from "lucide-react";

import { Card, CardContent } from "~/components/ui/card";
import { getProperties } from "~/server/actions";

export default async function Page() {
  const properties = await getProperties();

  const propertyList = properties.map((p) => (
    <Link key={p.id} href={`/properties/${p.id}`}>
      <Card className="h-24 w-2xs p-4">
        <CardContent className="flex flex-col items-center gap-2">
          <p>{p.name}</p>
          <p className="text-gray-500">
            Created at {p.createdAt.toLocaleDateString()}
          </p>
        </CardContent>
      </Card>
    </Link>
  ));

  return (
    <main>
      <h1 className="text-2xl">Properties</h1>
      <div className="mt-4 flex flex-wrap gap-4">
        <Link href={"/properties/new"}>
          <Card className="h-24 w-2xs">
            <CardContent className="flex flex-col items-center gap-2">
              <span>Create new property</span>
              <PlusCircle color="gray" />
            </CardContent>
          </Card>
        </Link>
        {properties && propertyList}
      </div>
    </main>
  );
}
