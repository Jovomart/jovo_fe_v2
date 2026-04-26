'use client'
<<<<<<< HEAD
import { useRouter } from 'next/navigation'
=======
>>>>>>> c7050bc08a9b18774be76bb542ced35d118ad6e6

// Top banner video slider — uses CDN video, no local asset required
const TopBanner = () => {
  return (
    <div className="w-full h-14 md:h-13 lg:h-15 overflow-hidden">
      <video
<<<<<<< HEAD
        src="/videos/Jovo_topbanner.mp4"  // Move video to public/videos/ folder
=======
        src="https://assets.mixkit.co/videos/242/242-720.mp4"
>>>>>>> c7050bc08a9b18774be76bb542ced35d118ad6e6
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