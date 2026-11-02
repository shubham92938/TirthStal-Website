import Hero              from "../components/home/Hero";
import Stats             from "../components/home/Stats";
import MarqueeStrip      from "../components/home/MarqueeStrip";
import BrowseByDeity     from "../components/home/BrowseByDeity";
import PopularTemples    from "../components/home/PopularTemples";
import UpcomingFestivals from "../components/home/UpcomingFestivals";
import GosevaCTA         from "../components/home/GosevaCTA";

export default function Home() {
  return (
    <div>
      <Hero />
      <Stats />
      <BrowseByDeity />
      <PopularTemples />
      <UpcomingFestivals />
      <GosevaCTA />
      <MarqueeStrip />
    </div>
  );
}
