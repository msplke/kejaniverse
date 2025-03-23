import { SignedIn, UserButton } from "@clerk/nextjs";

export default function Layout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="p-4">
      <div className="flex items-center justify-end py-2">
        <SignedIn>
          <UserButton />
        </SignedIn>
      </div>
      {children}
    </div>
  );
}
