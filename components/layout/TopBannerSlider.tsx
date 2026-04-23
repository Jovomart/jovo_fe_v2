'use client'
import { useRouter } from 'next/navigation'
// components/layout/TopBanner.jsx
import bannerVideo from "../../assets/videos/Jovo_topbanner.mp4"; // update path and filename to match yours

const TopBanner = () => {
  return (
    <div className="w-full h-14 md:h-13 lg:h-15 overflow-hidden">
      <video
        src={bannerVideo}
        autoPlay
        loop
        muted
        playsInline
        className="w-full h-full md:object-cover object-cover object-center"
      />
    </div>
  );
};

export default TopBanner;
