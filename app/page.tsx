import { Hero } from "@/components/home/Hero";
import { PartnerBand } from "@/components/home/PartnerBand";
import { ServiceIndex } from "@/components/home/ServiceIndex";
import { Trip } from "@/components/home/Trip";

export default function Home() {
  return (
    <>
      <Hero />
      <Trip />
      <ServiceIndex />
      <PartnerBand />
    </>
  );
}
