'use client'

// Top banner video slider — uses CDN video, no local asset required
const TopBanner = () => {
  return (
    <div className="w-full h-14 md:h-13 lg:h-15 overflow-hidden">
      <video
        src="https://assets.mixkit.co/videos/242/242-720.mp4"
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
