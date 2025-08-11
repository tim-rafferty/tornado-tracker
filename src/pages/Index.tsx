import HeroSection from "@/components/HeroSection";
import FeaturesSection from "@/components/FeaturesSection";
import AlertDemoSection from "@/components/AlertDemoSection";
import DownloadSection from "@/components/DownloadSection";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <HeroSection />
      <FeaturesSection />
      <AlertDemoSection />
      <DownloadSection />
    </div>
  );
};

export default Index;
