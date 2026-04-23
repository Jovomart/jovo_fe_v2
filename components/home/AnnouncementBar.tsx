'use client'
import { useRouter } from 'next/navigation'
import { FiPhoneCall } from "react-icons/fi";
import { useEffect, useState } from "react";


const messages = [
  "Hot deals every-day, Campus delivery in hours",
  "Call now for exclusive discounts: 0700 600 0000",
  "Grab your favorites before they're gone",
];

const AnnouncementBar = () => {
  const [current, setCurrent] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const messageTimer = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setCurrent((prev) => (prev + 1) % messages.length);
        setFade(true);
      }, 500); // fade duration
    }, 4000); // change every 4s

    return () => clearInterval(messageTimer);
  }, []);

  return (
    <div className="announcement-bar w-full bg-[#B42225] text-white py-2 px-2 md:px-4 flex items-center justify-center gap-2 flex-wrap">
      <FiPhoneCall className="icon" />
      <span className={`announcement-message ${fade ? "fade-in" : "fade-out"}`}>
        {messages[current]}
      </span>
    </div>
  );
};

export default AnnouncementBar;
