import { CallToAction } from "~/components/sections/cta";
import { Features } from "~/components/sections/features";
import { ForLandlords } from "~/components/sections/for-landlords";
import { ForTenants } from "~/components/sections/for-tenants";
import { HeroLanding } from "~/components/sections/hero-landing";

export default function LandingPage() {
  return (
    <>
      <HeroLanding />
      <Features />
      <ForLandlords />
      <ForTenants />
      <CallToAction />
    </>
  );
}
