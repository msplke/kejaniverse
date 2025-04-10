import { SignedIn, UserButton } from "@clerk/nextjs";

export default function Layout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="px-8 py-4">
      <div className="sticky top-0 flex items-center justify-end py-4">
        <SignedIn>
          <UserButton />
        </SignedIn>
      </div>
      {children}
    </div>
  );
}
