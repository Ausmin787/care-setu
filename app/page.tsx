import { Colonnade } from "@/components/home/Colonnade";
import { EquipmentReel } from "@/components/home/EquipmentReel";
import { Hero } from "@/components/home/Hero";
import { HowWeWork } from "@/components/home/HowWeWork";
import { PartnerBand } from "@/components/home/PartnerBand";
import { Trip } from "@/components/home/Trip";

// Home (D-027, D-030): the video hero and the ward-to-door trip, then the trip's line runs on through the
// services colonnade, the equipment reel, how we work, and the partner index, ending above the footer.
export default function Home() {
  return (
    <>
      <Hero />
      <Trip />
      <Colonnade />
      <EquipmentReel />
      <HowWeWork />
      <PartnerBand />
    </>
  );
}
