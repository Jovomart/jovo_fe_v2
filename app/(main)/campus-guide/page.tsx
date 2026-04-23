'use client'
import { useRouter } from 'next/navigation'
// src/pages/CampusGuidePage.jsx
import { useState, useMemo, useRef, useEffect } from "react";
import {
  FiSearch,
  FiX,
  FiMapPin,
  FiNavigation,
  FiClock,
  FiStar,
  FiPhone,
  FiChevronRight,
  FiArrowRight,
  FiInfo,
  FiBookmark,
  FiShare2,
  FiExternalLink,
  FiAlertCircle,
  FiChevronDown,
  FiChevronUp,
} from "react-icons/fi";
import {
  FaUniversity,
  FaHospital,
  FaUtensils,
  FaBook,
  FaMosque,
  FaChurch,
  FaFlask,
  FaRunning,
  FaBus,
  FaWifi,
  FaParking,
  FaRegBookmark,
  FaBookmark,
  FaStar,
  FaDirections,
} from "react-icons/fa";
import {
  MdOutlineSchool,
  MdOutlineSportsBasketball,
  MdLocalAtm,
  MdStorefront,
  MdOutlineMedicalServices,
  MdPrint,
  MdOutlineLocalLibrary,
  MdSecurity,
  MdOutlineAdminPanelSettings,
} from "react-icons/md";
import Footer from "@/components/layout/Footer";

/* ─────────────────────────────────────────────────────────────
   DATA
───────────────────────────────────────────────────────────── */
const categories = [
  {
    key: "all",
    label: "All Places",
    icon: <FiMapPin size={14} />,
    color: "#B42225",
  },
  {
    key: "academic",
    label: "Academic",
    icon: <MdOutlineSchool size={14} />,
    color: "#2563EB",
  },
  {
    key: "admin",
    label: "Admin",
    icon: <MdOutlineAdminPanelSettings size={14} />,
    color: "#7C3AED",
  },
  {
    key: "health",
    label: "Health",
    icon: <MdOutlineMedicalServices size={14} />,
    color: "#DC2626",
  },
  {
    key: "food",
    label: "Food & Eateries",
    icon: <FaUtensils size={14} />,
    color: "#D97706",
  },
  {
    key: "worship",
    label: "Worship",
    icon: <FaMosque size={14} />,
    color: "#059669",
  },
  {
    key: "sports",
    label: "Sports",
    icon: <FaRunning size={14} />,
    color: "#0891B2",
  },
  {
    key: "services",
    label: "Services",
    icon: <MdStorefront size={14} />,
    color: "#9333EA",
  },
  {
    key: "hostel",
    label: "Hostels",
    icon: <FaUniversity size={14} />,
    color: "#B45309",
  },
];

const locations = [
  // ── ACADEMIC ──
  {
    id: 1,
    category: "academic",
    name: "School of Engineering",
    shortName: "SEET",
    zone: "Main Campus – Zone A",
    description:
      "Houses departments of Mechanical, Civil, Chemical, Electrical/Electronic Engineering and more. One of FUTO's largest and most active schools.",
    image:
      "https://images.unsplash.com/photo-1562774053-701939374585?w=700&q=80",
    direction:
      "Enter FUTO main gate, turn right at the first major junction. SEET is the large complex on your left before the sports centre.",
    landmark: "Opposite the Staff Car Park",
    openHours: "Mon–Fri: 8am – 6pm",
    rating: 4.7,
    reviews: 214,
    popular: true,
    featured: true,
    facilities: ["Lecture Halls", "Labs", "Seminar Rooms", "HOD Offices"],
    tips: "Freshers should note that SEET 1 and SEET 2 are different wings. Most 100-level lectures hold in SEET 1.",
    phone: null,
    walkTime: "8 min from main gate",
  },
  {
    id: 2,
    category: "academic",
    name: "School of Science",
    shortName: "SCES",
    zone: "Main Campus – Zone B",
    description:
      "Hosts Physics, Chemistry, Biology, Mathematics, Biochemistry and Computer Science departments. Known for well-equipped science laboratories.",
    image:
      "https://images.unsplash.com/photo-1532094349884-543559b8c9d0?w=700&q=80",
    direction:
      "From the main gate proceed straight, pass the Senate Building on your right. SCES is the next major building cluster on the left.",
    landmark: "Next to the Faculty of Environmental Sciences",
    openHours: "Mon–Fri: 8am – 6pm",
    rating: 4.5,
    reviews: 187,
    facilities: [
      "Chemistry Labs",
      "Physics Labs",
      "Computer Lab",
      "Seminar Rooms",
    ],
    tips: "The Computer Science department is at the back of the main SCES block — follow the signboards.",
    walkTime: "10 min from main gate",
  },
  {
    id: 3,
    category: "academic",
    name: "ICT Centre",
    shortName: "ICT",
    zone: "Main Campus – Centre",
    description:
      "FUTO's primary Information and Communication Technology hub. Hosts computer labs, internet access, tech workshops, and serves as a Jovo pickup station.",
    image:
      "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=700&q=80",
    direction:
      "From the main gate, take the first left after the security post. The ICT Centre is the modern glass-and-steel building at the end of the road.",
    landmark: "Beside the University Senate Building",
    openHours: "Mon–Sat: 8am – 8pm",
    rating: 4.8,
    reviews: 342,
    popular: true,
    featured: true,
    facilities: [
      "Internet Cafe",
      "Computer Labs",
      "Printing Services",
      "Jovo Pickup Station",
    ],
    tips: "The ICT Centre has the fastest internet on campus. Bring your laptop — sockets are available. Jovo orders can be collected at the ICT desk between 9am–6pm.",
    phone: "+234 803 000 0001",
    walkTime: "5 min from main gate",
    badge: "🛍️ Jovo Pickup Here",
  },
  {
    id: 4,
    category: "academic",
    name: "FUTO Main Library",
    shortName: "Library",
    zone: "Main Campus – Centre",
    description:
      "The university's central library with over 200,000 volumes, digital resources, thesis archives, and dedicated reading rooms across multiple floors.",
    image:
      "https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=700&q=80",
    direction:
      "Proceed through the main gate and follow the central boulevard. The library is the tall multi-storey building on your right just before the administrative block.",
    landmark: "Adjacent to Senate Building",
    openHours: "Mon–Fri: 8am – 9pm | Sat: 9am – 5pm",
    rating: 4.6,
    reviews: 289,
    popular: true,
    facilities: [
      "Reading Rooms",
      "Digital Catalogue",
      "e-Library",
      "Photocopy Centre",
      "Thesis Room",
    ],
    tips: "Bring your student ID for access. The 3rd floor reading room is quietest for serious study. E-library login credentials come with your student portal account.",
    phone: "+234 803 000 0002",
    walkTime: "7 min from main gate",
  },
  {
    id: 5,
    category: "academic",
    name: "School of Environmental Sciences",
    shortName: "SEET-ENV",
    zone: "Main Campus – Zone B",
    description:
      "Hosts Architecture, Surveying, Urban & Regional Planning, Quantity Surveying and Building Technology programmes.",
    image:
      "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=700&q=80",
    direction:
      "From SCES, continue eastward along the faculty road. SEET-ENV is the complex with the large architectural drawing studios visible from the road.",
    landmark: "Behind the Main Library",
    openHours: "Mon–Fri: 8am – 5pm",
    rating: 4.3,
    reviews: 98,
    facilities: [
      "Design Studios",
      "Survey Labs",
      "Model Workshop",
      "Project Rooms",
    ],
    tips: "Architecture studio sessions often run late — food vendors park outside the building from 6pm onwards.",
    walkTime: "12 min from main gate",
  },

  // ── ADMIN ──
  {
    id: 6,
    category: "admin",
    name: "Senate Building",
    shortName: "Senate",
    zone: "Main Campus – Centre",
    description:
      "The administrative nerve centre of FUTO. Houses the Vice Chancellor's office, Registry, Bursary, and key university decision-making bodies.",
    image:
      "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=700&q=80",
    direction:
      "From the main gate, drive or walk straight along the central road. The Senate Building is the prominent white structure directly ahead after about 400 metres.",
    landmark: "Central campus, facing the main entrance boulevard",
    openHours: "Mon–Fri: 8am – 4pm",
    rating: 4.2,
    reviews: 156,
    featured: true,
    facilities: [
      "VC Office",
      "Registrar",
      "Bursary",
      "Student Affairs Office",
      "Exams & Records",
    ],
    tips: "Visit the Student Affairs Office on the ground floor for clearance, ID card issues, and academic matters. Dress formally when visiting the VC's area.",
    phone: "+234 803 000 0010",
    walkTime: "6 min from main gate",
  },
  {
    id: 7,
    category: "admin",
    name: "Student Affairs Division",
    shortName: "SAD",
    zone: "Senate Building – Ground Floor",
    description:
      "Your go-to office for matriculation, student ID cards, clearance forms, accommodation, health insurance, and all official student matters.",
    image:
      "https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=700&q=80",
    direction:
      "Enter the Senate Building from the main entrance. Student Affairs is on the ground floor, first corridor to your right.",
    landmark: "Inside Senate Building, Ground Floor",
    openHours: "Mon–Fri: 8am – 3:30pm",
    rating: 3.9,
    reviews: 211,
    facilities: [
      "ID Card Issuance",
      "Clearance Processing",
      "Accommodation Office",
      "Bursary Liaison",
    ],
    tips: "Go early — queues form quickly. Bring photocopies of ALL documents because the photocopy centre nearby closes early.",
    walkTime: "6 min from main gate",
  },
  {
    id: 8,
    category: "admin",
    name: "FUTO Bursary Department",
    shortName: "Bursary",
    zone: "Senate Building – 1st Floor",
    description:
      "Handles all financial matters: school fee payments, receipts, scholarships, bursaries, and financial clearance for all students.",
    image:
      "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=700&q=80",
    direction:
      "Inside the Senate Building, take the main staircase to the 1st floor. Bursary is to the left at the top of the stairs.",
    landmark: "Senate Building – 1st Floor, Left Wing",
    openHours: "Mon–Fri: 8am – 3pm",
    rating: 3.7,
    reviews: 178,
    facilities: [
      "Payment Confirmation",
      "Receipt Issuance",
      "Scholarship Processing",
      "Financial Clearance",
    ],
    tips: "Online payments on the student portal are confirmed here. Always print your e-receipt before coming. Peak periods are start and end of semester.",
    phone: "+234 803 000 0011",
    walkTime: "6 min from main gate",
  },

  // ── HEALTH ──
  {
    id: 9,
    category: "health",
    name: "FUTO Medical Centre",
    shortName: "Medical",
    zone: "Main Campus – South Wing",
    description:
      "The university's primary healthcare facility offering outpatient services, first aid, pharmacy, and referrals to FUTO Teaching Hospital. Free treatment for registered students.",
    image:
      "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=700&q=80",
    direction:
      "From the main gate, take the road to the left of the Senate Building. Follow it south for about 300 metres. The Medical Centre is the white building with a red cross.",
    landmark: "Behind the SUG Secretariat, near Female Hostel Zone",
    openHours: "24/7 Emergency | Outpatient: 8am – 5pm",
    rating: 4.4,
    reviews: 267,
    popular: true,
    facilities: [
      "Outpatient Clinic",
      "Pharmacy",
      "Laboratory",
      "Emergency Bay",
      "Dental Clinic",
    ],
    tips: "Bring your student ID and Health Insurance booklet. Most treatments are free or subsidised. Emergency services run 24/7 — call ahead for serious cases.",
    phone: "+234 803 000 0020",
    walkTime: "10 min from main gate",
    badge: "🏥 24/7 Emergency",
  },
  {
    id: 10,
    category: "health",
    name: "FUTO Teaching Hospital",
    shortName: "FTH",
    zone: "FUTO Road, Off Campus",
    description:
      "The main referral hospital attached to FUTO. Handles specialist care, surgeries, maternity, paediatrics, and all advanced medical needs.",
    image:
      "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=700&q=80",
    direction:
      "Exit FUTO main gate, turn right onto FUTO Road. Drive approximately 1.5km. The Teaching Hospital is on your left, after the FUTO Staff Quarters.",
    landmark: "Along FUTO Road, before Ihiagwa Junction",
    openHours: "24/7",
    rating: 4.5,
    reviews: 198,
    popular: true,
    facilities: [
      "A&E",
      "Maternity Ward",
      "Specialist Clinics",
      "Surgery",
      "ICU",
      "Pharmacy",
    ],
    tips: "The hospital is off campus — take a campus shuttle or bike. Keep your insurance card with you always. Students get discounted rates at the outpatient clinic.",
    phone: "+234 803 000 0021",
    walkTime: "15 min by bus from main gate",
  },

  // ── FOOD ──
  {
    id: 11,
    category: "food",
    name: "FUTO Main Cafeteria",
    shortName: "Cafeteria",
    zone: "Main Campus – Centre",
    description:
      "The university's largest dining facility serving breakfast, lunch, and dinner. Offers local Nigerian dishes, rice dishes, snacks, and drinks at affordable student prices.",
    image:
      "https://images.unsplash.com/photo-1567521464027-f127ff144326?w=700&q=80",
    direction:
      "Located directly behind the Senate Building. Follow the path between the Senate and the Library, the cafeteria is the large open-roofed building.",
    landmark: "Behind Senate Building",
    openHours: "Mon–Sun: 7am – 9pm",
    rating: 4.1,
    reviews: 434,
    popular: true,
    facilities: [
      "Breakfast Counter",
      "Main Dishes",
      "Snack Bar",
      "Drinks Station",
      "Outdoor Seating",
    ],
    tips: "Arrive before 1pm for lunch to avoid the crowd. The jollof rice on Wednesdays is legendary on campus. Prices are generally lower than off-campus eateries.",
    walkTime: "7 min from main gate",
  },
  {
    id: 12,
    category: "food",
    name: "Engineering Faculty Canteen",
    shortName: "SEET Canteen",
    zone: "Near SEET Building",
    description:
      "Busy student canteen serving quick meals, snacks, cold drinks, shawarma, and small chops. Very popular during lecture breaks.",
    image:
      "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=700&q=80",
    direction:
      "Right beside the SEET main entrance. Walk to SEET and you'll find the canteen cluster on the western side of the building.",
    landmark: "Beside SEET Main Entrance",
    openHours: "Mon–Sat: 7:30am – 7pm",
    rating: 4.3,
    reviews: 312,
    popular: true,
    facilities: [
      "Shawarma Stand",
      "Rice & Stew Counter",
      "Cold Drinks",
      "Snacks",
    ],
    tips: "Gets very crowded between 12pm and 2pm. The shawarma stand is one of the best on campus — get there early.",
    walkTime: "9 min from main gate",
  },
  {
    id: 13,
    category: "food",
    name: "SUG Complex Food Court",
    shortName: "SUG Food Court",
    zone: "SUG Complex",
    description:
      "A cluster of food vendors around the Student Union Government complex, including rice, beans, pepper soup, and popular night food spots.",
    image:
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=700&q=80",
    direction:
      "From the Senate Building, follow the road south-west towards the Student Union building. The food court is the open area surrounding the SUG complex.",
    landmark: "Around SUG Secretariat",
    openHours: "Mon–Sun: 8am – 11pm",
    rating: 4.0,
    reviews: 287,
    facilities: ["Night Eateries", "Pepper Soup Spot", "Grills", "Cold Store"],
    tips: "The night food spots here run until midnight during exams. The pepper soup spot is popular with both students and staff — worth the wait.",
    walkTime: "9 min from main gate",
  },

  // ── WORSHIP ──
  {
    id: 14,
    category: "worship",
    name: "FUTO Chapel of Redemption",
    shortName: "Chapel",
    zone: "Main Campus – North",
    description:
      "The university's official Christian chapel hosting interdenominational services, vigils, choir rehearsals, and student fellowship meetings every week.",
    image:
      "https://images.unsplash.com/photo-1438032005730-c779502df39b?w=700&q=80",
    direction:
      "From the main gate, take the northern road past the VC's lodge. The Chapel is the large white building with stained-glass windows on the left.",
    landmark: "Near the VC Lodge, North Campus",
    openHours: "Sunday: 7am – 1pm | Wed: 5pm – 7pm | Events vary",
    rating: 4.8,
    reviews: 198,
    facilities: [
      "Main Auditorium",
      "Prayer Garden",
      "Choir Room",
      "Counselling Room",
    ],
    tips: "Sunday service starts at 8am. Fellowship meetings for various groups run throughout the week — check the notice board at the entrance.",
    walkTime: "12 min from main gate",
  },
  {
    id: 15,
    category: "worship",
    name: "FUTO Central Mosque",
    shortName: "Mosque",
    zone: "Main Campus – South",
    description:
      "The university's main mosque serving Muslim students and staff. Hosts Friday Jumu'ah prayers, Ramadan programmes, and Islamic education activities.",
    image:
      "https://images.unsplash.com/photo-1564769662533-4f00a87b4056?w=700&q=80",
    direction:
      "From the medical centre, continue south for about 200 metres. The mosque is on the right side, identifiable by its green dome and minaret.",
    landmark: "Near Medical Centre, South Campus",
    openHours: "Daily prayers | Friday Jumu'ah: 1pm",
    rating: 4.7,
    reviews: 143,
    facilities: [
      "Main Prayer Hall",
      "Wudu Area",
      "Islamic Library",
      "Women's Section",
    ],
    tips: "Arrive 20 minutes early for Friday Jumu'ah — it gets very full. Bring your own prayer mat on busy days.",
    walkTime: "11 min from main gate",
  },

  // ── SPORTS ──
  {
    id: 16,
    category: "sports",
    name: "FUTO Sports Complex",
    shortName: "Sports",
    zone: "Main Campus – East",
    description:
      "FUTO's primary sporting facility featuring a standard football pitch, running track, tennis courts, basketball court, and multipurpose hall.",
    image:
      "https://images.unsplash.com/photo-1568205631234-eb01038b53be?w=700&q=80",
    direction:
      "From SEET, continue east along the main road. The Sports Complex is clearly visible from the road — you'll see the floodlights and track.",
    landmark: "East of SEET, near the back gate",
    openHours: "Mon–Sat: 6am – 8pm",
    rating: 4.5,
    reviews: 176,
    popular: true,
    facilities: [
      "Football Pitch",
      "Athletics Track",
      "Basketball Courts",
      "Tennis Courts",
      "Gym Room",
    ],
    tips: "The gym opens at 6am — great for early morning workouts. Bring your student ID. Interschool matches are open to spectators, check the SUG noticeboard.",
    walkTime: "14 min from main gate",
  },
  {
    id: 17,
    category: "sports",
    name: "FUTO Swimming Pool",
    shortName: "Pool",
    zone: "Sports Complex Area",
    description:
      "A standard university swimming pool open to students and staff for recreation and competitive training. Swimming lessons are available on request.",
    image:
      "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=700&q=80",
    direction:
      "Located within the Sports Complex area. Enter through the main sports gate and follow signs to the pool — it's behind the multipurpose hall.",
    landmark: "Behind Sports Multipurpose Hall",
    openHours: "Tue, Thu, Sat: 9am – 5pm",
    rating: 4.2,
    reviews: 87,
    facilities: [
      "Olympic-size Pool",
      "Changing Rooms",
      "Lockers",
      "Lifeguard Station",
    ],
    tips: "The pool is only open 3 days a week — plan accordingly. Swimwear is mandatory. Lessons can be arranged with the sports department.",
    walkTime: "15 min from main gate",
  },

  // ── SERVICES ──
  {
    id: 18,
    category: "services",
    name: "Campus ATM Zone",
    shortName: "ATMs",
    zone: "Near Senate Building",
    description:
      "A cluster of ATMs from multiple Nigerian banks including GTBank, First Bank, UBA, and Access Bank — the most accessible banking point on campus.",
    image:
      "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=700&q=80",
    direction:
      "The ATM zone is along the main boulevard, just before the Senate Building on the left-hand side. Look for the small covered kiosk structure.",
    landmark: "Main Boulevard, before Senate Building",
    openHours: "24/7 (machine dependent)",
    rating: 3.8,
    reviews: 412,
    popular: true,
    facilities: ["GTBank ATM", "First Bank ATM", "UBA ATM", "Access Bank ATM"],
    tips: "ATMs are busiest on Mondays and around school fee deadlines. The First Bank machine tends to have the most consistent uptime. Avoid weekends for large withdrawals.",
    walkTime: "5 min from main gate",
  },
  {
    id: 19,
    category: "services",
    name: "Campus Print & Photocopy Centre",
    shortName: "Print Centre",
    zone: "Near ICT Centre",
    description:
      "Full printing, photocopying, scanning, binding, and lamination services. Essential for project submissions, assignments, and official document processing.",
    image:
      "https://images.unsplash.com/photo-1612198188060-c7c2a3b66eae?w=700&q=80",
    direction:
      "Immediately beside the ICT Centre entrance. Look for the small shop fronts with the printing signs.",
    landmark: "Beside ICT Centre",
    openHours: "Mon–Sat: 8am – 7pm",
    rating: 4.3,
    reviews: 298,
    facilities: [
      "Printing",
      "Photocopying",
      "Scanning",
      "Binding",
      "Lamination",
    ],
    tips: "During exam/project season, go before 10am or after 4pm to avoid long queues. The shop closest to the ICT entrance usually has the fastest turnaround.",
    walkTime: "5 min from main gate",
  },
  {
    id: 20,
    category: "services",
    name: "Campus Security Post",
    shortName: "Security",
    zone: "Main Gate",
    description:
      "The main campus security post managing entry/exit, lost property, emergency response, and campus safety. Report incidents here first.",
    image:
      "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=700&q=80",
    direction:
      "Located directly at the main campus entrance/exit gate. Unmissable.",
    landmark: "Main Entrance Gate",
    openHours: "24/7",
    rating: 4.0,
    reviews: 134,
    facilities: [
      "Visitor Registration",
      "Lost & Found",
      "Emergency Contact",
      "Parking Control",
    ],
    tips: "Always carry your student ID — security checks are routine. Report lost items immediately as they're logged and kept for collection.",
    phone: "+234 803 000 0030",
    walkTime: "At main gate",
  },

  // ── HOSTEL ──
  {
    id: 21,
    category: "hostel",
    name: "Female Hostel Complex",
    shortName: "Female Hostel",
    zone: "South Campus",
    description:
      "The main on-campus female residential complex consisting of multiple halls. Managed by the university with security, water supply, and basic amenities.",
    image:
      "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=700&q=80",
    direction:
      "From the main gate, take the road to the left past the medical centre. Follow the signs for 'Female Hostel' — it's the large compound in the south campus.",
    landmark: "South of Medical Centre",
    openHours: "Gates close at 10pm",
    rating: 3.9,
    reviews: 201,
    facilities: [
      "Rooms",
      "Bathrooms",
      "Common Room",
      "Security",
      "Water Supply",
    ],
    tips: "Hostel allocation is through the accommodation office in Student Affairs. Apply early — spaces fill fast. Gates close at 10pm sharp.",
    walkTime: "12 min from main gate",
  },
  {
    id: 22,
    category: "hostel",
    name: "Male Hostel Complex",
    shortName: "Male Hostel",
    zone: "North-East Campus",
    description:
      "The on-campus male residential halls. Multiple blocks with rooms of varying sizes. Application through the Student Affairs accommodation unit.",
    image:
      "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=700&q=80",
    direction:
      "From the sports complex, head north. The Male Hostel complex is the row of multi-storey buildings on the north-east end of campus.",
    landmark: "North-East, near Sports Complex",
    openHours: "Open – no curfew for male halls",
    rating: 3.6,
    reviews: 178,
    facilities: [
      "Rooms",
      "Bathrooms",
      "Common Area",
      "Security",
      "Water Supply",
    ],
    tips: "Power cuts are common — bring a rechargeable lamp and power bank. Many students fix their own inverters. Security is present but lock your room always.",
    walkTime: "16 min from main gate",
  },
];

const quickFacts = [
  { icon: "🏫", label: "Founded", value: "1980" },
  { icon: "🎓", label: "Students", value: "~30,000" },
  { icon: "🏛️", label: "Faculties", value: "9 Schools" },
  { icon: "📍", label: "Location", value: "Ihiagwa, Owerri" },
  { icon: "🏆", label: "Ranking", value: "Top 15 Nigeria" },
  { icon: "🌐", label: "Website", value: "futo.edu.ng" },
];

const campusTips = [
  {
    icon: "🚶",
    title: "Getting Around",
    tip: "Most buildings are 5–15 min apart on foot. Campus buses run limited routes. Okadas (motorbikes) are common and affordable for longer distances.",
  },
  {
    icon: "📱",
    title: "Campus WiFi",
    tip: "Free WiFi is available at the ICT Centre and Library. Login with your student portal credentials. Speed is best in off-peak hours (before 9am, after 7pm).",
  },
  {
    icon: "💳",
    title: "Student ID",
    tip: "Your student ID is your passport on campus. Keep it on you at all times for access to facilities, the medical centre, library, and ATM student rates.",
  },
  {
    icon: "🌧️",
    title: "Rainy Season",
    tip: "FUTO gets heavy rains from April–October. The roads near SEET can flood. Wear comfortable waterproof shoes and always have an umbrella handy.",
  },
  {
    icon: "🕐",
    title: "Office Hours",
    tip: "Most administrative offices work strictly Mon–Fri, 8am–3pm. Student Affairs is most accessible on Tuesday and Thursday mornings.",
  },
  {
    icon: "🚨",
    title: "Emergency",
    tip: "Campus Security: +234 803 000 0030. Medical: +234 803 000 0020. Always save these numbers. The security post at the main gate operates 24/7.",
  },
];

const popularRoutes = [
  {
    from: "Main Gate",
    to: "ICT Centre",
    time: "5 min",
    steps: [
      "Enter main gate",
      "Take first left",
      "Walk straight 300m",
      "ICT Centre on right",
    ],
  },
  {
    from: "Main Gate",
    to: "Senate Building",
    time: "6 min",
    steps: [
      "Enter main gate",
      "Walk straight on main boulevard",
      "Senate is the large white building ahead",
    ],
  },
  {
    from: "ICT Centre",
    to: "Library",
    time: "3 min",
    steps: [
      "Exit ICT Centre main door",
      "Turn right",
      "Walk 200m along the path",
      "Library entrance on your left",
    ],
  },
  {
    from: "SEET",
    to: "Medical Centre",
    time: "10 min",
    steps: [
      "Exit SEET main gate",
      "Turn left",
      "Walk past Senate Building",
      "Turn left at the T-junction",
      "Medical Centre is 150m ahead",
    ],
  },
];

/* ─────────────────────────────────────────────────────────────
   COMPONENTS
───────────────────────────────────────────────────────────── */

const getCatColor = (cat) => {
  const map = {
    academic: "#2563EB",
    admin: "#7C3AED",
    health: "#DC2626",
    food: "#D97706",
    worship: "#059669",
    sports: "#0891B2",
    services: "#9333EA",
    hostel: "#B45309",
  };
  return map[cat] || "#B42225";
};

const getCatIcon = (cat) => {
  const map = {
    academic: <MdOutlineSchool size={13} />,
    admin: <MdOutlineAdminPanelSettings size={13} />,
    health: <MdOutlineMedicalServices size={13} />,
    food: <FaUtensils size={12} />,
    worship: <FaMosque size={12} />,
    sports: <FaRunning size={12} />,
    services: <MdStorefront size={13} />,
    hostel: <FaUniversity size={12} />,
  };
  return map[cat] || <FiMapPin size={12} />;
};

// Location card
const LocationCard = ({ loc, onBookmark, bookmarked, onSelect }) => {
  const color = getCatColor(loc.category);
  return (
    <div
      onClick={() => onSelect(loc)}
      className="group bg-white rounded-3xl overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-2"
      style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.08)" }}
    >
      {/* Image */}
      <div className="relative overflow-hidden" style={{ aspectRatio: "16/9" }}>
        <img
          src={loc.image}
          alt={loc.name}
          className="w-full h-full object-cover transition-transform duration-600 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent" />

        {/* Category badge */}
        <div
          className="absolute top-3 left-3 flex items-center gap-1.5 text-white text-[10px] font-black px-2.5 py-1.5 rounded-full"
          style={{ background: color }}
        >
          {getCatIcon(loc.category)}
          {loc.category.toUpperCase()}
        </div>

        {/* Jovo badge */}
        {loc.badge && (
          <div className="absolute top-3 right-10 bg-[#B42225] text-white text-[9px] font-black px-2 py-1 rounded-full">
            {loc.badge}
          </div>
        )}

        {/* Bookmark */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onBookmark(loc.id);
          }}
          className="absolute top-3 right-3 w-7 h-7 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/40 transition"
        >
          {bookmarked ? (
            <FaBookmark size={11} className="text-yellow-400" />
          ) : (
            <FaRegBookmark size={11} className="text-white" />
          )}
        </button>

        {/* Walk time */}
        <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-black/60 text-white text-[10px] font-semibold px-2 py-1 rounded-full backdrop-blur-sm">
          <FiClock size={10} /> {loc.walkTime}
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <h3
            className="font-black text-gray-900 text-sm md:text-base leading-snug group-hover:text-[#B42225] transition-colors"
            style={{ fontFamily: "'Georgia', serif" }}
          >
            {loc.name}
          </h3>
          {loc.popular && (
            <span className="shrink-0 text-[9px] font-black bg-orange-50 text-orange-500 px-2 py-0.5 rounded-full border border-orange-100">
              🔥 POPULAR
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 mb-2">
          <FiMapPin size={10} className="text-gray-400 shrink-0" />
          <span className="text-[11px] text-gray-400 truncate">{loc.zone}</span>
        </div>

        <p className="text-xs text-gray-500 line-clamp-2 mb-3">
          {loc.description}
        </p>

        {/* Rating + hours */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <FaStar
                key={s}
                size={10}
                style={{
                  color: s <= Math.round(loc.rating) ? "#F59E0B" : "#E5E7EB",
                }}
              />
            ))}
            <span className="text-[11px] text-gray-600 font-bold ml-1">
              {loc.rating}
            </span>
            <span className="text-[11px] text-gray-400">({loc.reviews})</span>
          </div>
          <div className="flex items-center gap-1 text-[10px] text-gray-400">
            <FiClock size={9} />
            <span className="truncate max-w-30">
              {loc.openHours.split("|")[0]}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Detail modal
const LocationModal = ({ loc, onClose, onBookmark, bookmarked }) => {
  const [dirOpen, setDirOpen] = useState(true);
  const color = getCatColor(loc.category);

  return (
    <div
      className="fixed inset-0 z-100 flex items-end md:items-center justify-center p-0 md:p-4"
      style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
    >
      <div
        className="bg-white w-full md:max-w-2xl max-h-[92vh] md:rounded-3xl rounded-t-3xl overflow-hidden flex flex-col"
        style={{ boxShadow: "0 30px 80px rgba(0,0,0,0.3)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Image header */}
        <div className="relative shrink-0" style={{ height: "220px" }}>
          <img
            src={loc.image}
            alt={loc.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent" />

          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/60 transition"
          >
            <FiX size={18} />
          </button>

          <button
            onClick={() => onBookmark(loc.id)}
            className="absolute top-4 right-14 w-9 h-9 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/60 transition"
          >
            {bookmarked ? (
              <FaBookmark size={14} className="text-yellow-400" />
            ) : (
              <FaRegBookmark size={14} />
            )}
          </button>

          <div className="absolute bottom-4 left-4 right-4">
            <div className="flex items-center gap-2 mb-2">
              <span
                className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full text-white"
                style={{ background: color }}
              >
                {loc.category}
              </span>
              {loc.badge && (
                <span className="text-[10px] font-black bg-[#B42225] text-white px-2 py-0.5 rounded-full">
                  {loc.badge}
                </span>
              )}
            </div>
            <h2
              className="text-xl font-black text-white leading-tight"
              style={{ fontFamily: "'Georgia', serif" }}
            >
              {loc.name}
            </h2>
            <p className="text-white/70 text-xs mt-1 flex items-center gap-1">
              <FiMapPin size={10} /> {loc.zone}
            </p>
          </div>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-gray-50 rounded-2xl p-3 text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <FaStar
                    key={s}
                    size={9}
                    style={{
                      color:
                        s <= Math.round(loc.rating) ? "#F59E0B" : "#E5E7EB",
                    }}
                  />
                ))}
              </div>
              <p className="text-sm font-black text-gray-900">{loc.rating}</p>
              <p className="text-[10px] text-gray-400">{loc.reviews} reviews</p>
            </div>
            <div className="bg-gray-50 rounded-2xl p-3 text-center">
              <FiClock size={16} className="mx-auto mb-1 text-gray-500" />
              <p className="text-[11px] font-bold text-gray-700 leading-tight">
                {loc.openHours.split("|")[0].trim()}
              </p>
              <p className="text-[10px] text-gray-400">Hours</p>
            </div>
            <div className="bg-gray-50 rounded-2xl p-3 text-center">
              <FiNavigation size={16} className="mx-auto mb-1 text-gray-500" />
              <p className="text-[11px] font-bold text-gray-700">
                {loc.walkTime}
              </p>
              <p className="text-[10px] text-gray-400">Walk time</p>
            </div>
          </div>

          {/* Description */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2">
              About
            </h4>
            <p className="text-sm text-gray-600 leading-relaxed">
              {loc.description}
            </p>
          </div>

          {/* Facilities */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-3">
              Facilities
            </h4>
            <div className="flex flex-wrap gap-2">
              {loc.facilities.map((f) => (
                <span
                  key={f}
                  className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-full"
                  style={{ background: color + "15", color }}
                >
                  <FiStar size={10} /> {f}
                </span>
              ))}
            </div>
          </div>

          {/* Directions */}
          <div className="rounded-2xl border border-gray-100 overflow-hidden">
            <button
              className="w-full flex items-center justify-between p-4"
              onClick={() => setDirOpen(!dirOpen)}
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-white"
                  style={{ background: color }}
                >
                  <FiNavigation size={14} />
                </div>
                <h4 className="text-sm font-black text-gray-900">
                  How to Get There
                </h4>
              </div>
              {dirOpen ? (
                <FiChevronUp size={16} className="text-gray-400" />
              ) : (
                <FiChevronDown size={16} className="text-gray-400" />
              )}
            </button>
            {dirOpen && (
              <div className="px-4 pb-4 space-y-2 border-t border-gray-100">
                <p className="text-xs text-gray-500 pt-3 leading-relaxed">
                  {loc.direction}
                </p>
                {loc.landmark && (
                  <div className="flex items-center gap-2 bg-blue-50 rounded-xl p-2.5 text-xs text-blue-700">
                    <FiMapPin size={12} className="shrink-0" />
                    <span>
                      <strong>Landmark:</strong> {loc.landmark}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Pro tip */}
          {loc.tips && (
            <div className="flex gap-3 bg-amber-50 border border-amber-100 rounded-2xl p-4">
              <span className="text-lg shrink-0">💡</span>
              <div>
                <p className="text-xs font-black text-amber-800 mb-1">
                  Pro Tip
                </p>
                <p className="text-xs text-amber-700 leading-relaxed">
                  {loc.tips}
                </p>
              </div>
            </div>
          )}

          {/* Phone / Actions */}
          {loc.phone && (
            <a
              href={`tel:${loc.phone}`}
              className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl font-bold text-sm text-white transition hover:opacity-90"
              style={{ background: color }}
            >
              <FiPhone size={15} /> Call {loc.shortName}
            </a>
          )}

          <a
            href={`https://maps.google.com/?q=FUTO+${encodeURIComponent(loc.name)}+Owerri`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl font-bold text-sm border-2 text-gray-700 hover:border-gray-400 transition"
            style={{ borderColor: "#E5E7EB" }}
          >
            <FiExternalLink size={15} /> Open in Google Maps
          </a>
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────────────────────── */
const CampusGuidePage = () => {
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [selectedLoc, setSelectedLoc] = useState(null);
  const [bookmarks, setBookmarks] = useState([]);
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [showRoutes, setShowRoutes] = useState(false);
  const searchRef = useRef(null);

  useEffect(() => {
    const h = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target))
        setSearchFocused(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const toggleBookmark = (id) =>
    setBookmarks((p) =>
      p.includes(id) ? p.filter((b) => b !== id) : [...p, id],
    );

  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    return locations.filter(
      (l) =>
        l.name.toLowerCase().includes(q) ||
        l.shortName.toLowerCase().includes(q) ||
        l.zone.toLowerCase().includes(q) ||
        l.description.toLowerCase().includes(q) ||
        l.category.toLowerCase().includes(q) ||
        l.facilities.some((f) => f.toLowerCase().includes(q)),
    );
  }, [searchQuery]);

  const filteredLocations = useMemo(() => {
    if (showBookmarks) return locations.filter((l) => bookmarks.includes(l.id));
    if (activeCategory === "all") return locations;
    return locations.filter((l) => l.category === activeCategory);
  }, [activeCategory, showBookmarks, bookmarks]);

  const isSearching = searchQuery.trim().length > 0;
  const displayLocations = isSearching ? searchResults : filteredLocations;
  const featured = locations.filter((l) => l.featured);

  return (
    <>
      <style>{`
        @keyframes fadeIn { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }
        .loc-enter { animation: fadeIn 0.3s ease; }
         .scrollbar-hide::-webkit-scrollbar { display: none; }
      `}</style>

      {selectedLoc && (
        <LocationModal
          loc={selectedLoc}
          onClose={() => setSelectedLoc(null)}
          onBookmark={toggleBookmark}
          bookmarked={bookmarks.includes(selectedLoc.id)}
        />
      )}

      <div className="min-h-screen" style={{ background: "#F3F4F8" }}>
        {/* ══════════ HERO ══════════ */}
        <div
          className="relative overflow-hidden"
          style={{
            background:
              "linear-gradient(135deg, #0a0a0a 0%, #1a0a2e 35%, #2d1460 65%, #3d1a8a 100%)",
            minHeight: "380px",
          }}
        >
          {/* Orbs */}
          <div
            className="absolute -top-20 left-1/4 w-96 h-96 rounded-full opacity-20 pointer-events-none"
            style={{
              background: "radial-gradient(circle,#7C3AED,transparent 70%)",
            }}
          />
          <div
            className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full opacity-15 pointer-events-none"
            style={{
              background: "radial-gradient(circle,#B42225,transparent 70%)",
            }}
          />

          {/* Dot grid */}
          <div
            className="absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage:
                "radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)",
              backgroundSize: "32px 32px",
            }}
          />

          <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 pt-10 pb-20">
            <div className="flex items-center gap-2 mb-6">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{
                  background: "rgba(124,58,237,0.3)",
                  border: "1px solid rgba(167,139,250,0.4)",
                }}
              >
                <FaUniversity className="text-purple-300" size={14} />
              </div>
              <span className="text-purple-300/70 text-xs font-bold uppercase tracking-widest">
                FUTO Campus
              </span>
            </div>

            <h1
              className="text-4xl md:text-6xl font-black text-white leading-tight mb-4"
              style={{
                fontFamily: "'Georgia', serif",
                textShadow: "0 4px 30px rgba(124,58,237,0.4)",
              }}
            >
              Campus
              <br />
              <span
                style={{
                  background: "linear-gradient(90deg,#c4b5fd,#f0abfc,#c4b5fd)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Guide
              </span>
            </h1>
            <p className="text-white/50 text-sm md:text-base max-w-md mb-8">
              Every building, office, eatery, and facility at Federal University
              of Technology, Owerri — with directions, tips, and more.
            </p>

            {/* Quick facts */}
            <div className="flex flex-wrap gap-3">
              {quickFacts.map(({ icon, label, value }) => (
                <div
                  key={label}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs"
                  style={{
                    background: "rgba(255,255,255,0.08)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    backdropFilter: "blur(8px)",
                  }}
                >
                  <span>{icon}</span>
                  <span className="text-white/50">{label}:</span>
                  <span className="text-white font-bold">{value}</span>
                </div>
              ))}
            </div>
          </div>

          <svg
            className="absolute bottom-0 left-0 w-full"
            viewBox="0 0 1440 50"
            preserveAspectRatio="none"
          >
            <path
              d="M0,50 L0,25 Q360,0 720,25 Q1080,50 1440,25 L1440,50 Z"
              fill="#F3F4F8"
            />
          </svg>
        </div>

        {/* ══════════ STICKY SEARCH + FILTERS ══════════ */}
        <div
          className="sticky top-0 z-40 bg-white/95 backdrop-blur-xl border-b border-gray-100"
          style={{ boxShadow: "0 2px 20px rgba(0,0,0,0.06)" }}
        >
          <div className="max-w-7xl mx-auto px-4 md:px-8 py-3">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {/* Search */}
              <div className="relative flex-1 max-w-sm" ref={searchRef}>
                <div
                  className={`flex items-center gap-2 rounded-2xl border px-3 py-2.5 transition-all duration-200 ${
                    searchFocused
                      ? "border-purple-500 shadow-[0_0_0_3px_rgba(124,58,237,0.1)] bg-white"
                      : "border-gray-200 bg-gray-50"
                  }`}
                >
                  <FiSearch
                    size={15}
                    className={
                      searchFocused ? "text-purple-500" : "text-gray-400"
                    }
                  />
                  <input
                    type="text"
                    placeholder="Search locations, buildings, services..."
                    className="flex-1 text-sm outline-none bg-transparent placeholder-gray-400 text-gray-700"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setSearchFocused(true)}
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="text-gray-400 hover:text-gray-600 transition"
                    >
                      <FiX size={14} />
                    </button>
                  )}
                </div>

                {/* Search dropdown */}
                {searchFocused && searchQuery.trim().length > 0 && (
                  <div
                    className="absolute top-full mt-2 left-0 right-0 bg-white rounded-2xl border border-gray-100 overflow-hidden z-50"
                    style={{ boxShadow: "0 20px 50px rgba(0,0,0,0.15)" }}
                  >
                    {searchResults.length > 0 ? (
                      <>
                        <p className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold px-4 pt-3 pb-1">
                          {searchResults.length} location
                          {searchResults.length > 1 ? "s" : ""} found
                        </p>
                        {searchResults.slice(0, 6).map((l) => (
                          <div
                            key={l.id}
                            onMouseDown={() => {
                              setSelectedLoc(l);
                              setSearchQuery("");
                              setSearchFocused(false);
                            }}
                            className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors"
                          >
                            <img
                              src={l.image}
                              alt=""
                              className="w-10 h-10 rounded-xl object-cover shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold text-gray-800">
                                {l.name}
                              </p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span
                                  className="text-[9px] font-bold uppercase"
                                  style={{ color: getCatColor(l.category) }}
                                >
                                  {l.category}
                                </span>
                                <span className="text-[9px] text-gray-400 flex items-center gap-0.5">
                                  <FiClock size={8} />
                                  {l.walkTime}
                                </span>
                              </div>
                            </div>
                            <FiChevronRight
                              size={13}
                              className="text-gray-300 shrink-0"
                            />
                          </div>
                        ))}
                      </>
                    ) : (
                      <div className="px-4 py-6 text-center">
                        <FiSearch
                          size={24}
                          className="text-gray-300 mx-auto mb-2"
                        />
                        <p className="text-sm font-bold text-gray-500">
                          No results for "{searchQuery}"
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          Try "Library", "Cafeteria", or "Medical"
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Category tabs */}
              <div
                className="flex items-center gap-1.5 overflow-x-auto flex-nowrap pb-0.5 sm:pb-0 scrollbar-hide"
                style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
              >
                {categories.map(({ key, label, icon, color }) => (
                  <button
                    key={key}
                    onClick={() => {
                      setActiveCategory(key);
                      setShowBookmarks(false);
                      setSearchQuery("");
                    }}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
                      activeCategory === key && !showBookmarks
                        ? "text-white shadow-md"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                    style={
                      activeCategory === key && !showBookmarks
                        ? { background: color }
                        : {}
                    }
                  >
                    {icon} {label}
                  </button>
                ))}
                {/* Saved */}
                <button
                  onClick={() => {
                    setShowBookmarks(!showBookmarks);
                    setActiveCategory("all");
                  }}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
                    showBookmarks
                      ? "bg-yellow-400 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  <FaBookmark size={11} /> Saved ({bookmarks.length})
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 space-y-10">
          {/* ══════════ SEARCH RESULTS ══════════ */}
          {isSearching ? (
            <div>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-1 h-7 rounded-full bg-purple-500" />
                <h2
                  className="text-xl font-black text-gray-900"
                  style={{ fontFamily: "'Georgia', serif" }}
                >
                  Results for "{searchQuery}"
                </h2>
                <span className="text-sm text-gray-400">
                  ({searchResults.length} found)
                </span>
              </div>
              {searchResults.length > 0 ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                  {searchResults.map((l) => (
                    <div key={l.id} className="loc-enter">
                      <LocationCard
                        loc={l}
                        onBookmark={toggleBookmark}
                        bookmarked={bookmarks.includes(l.id)}
                        onSelect={setSelectedLoc}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20">
                  <FiMapPin size={48} className="text-gray-300 mx-auto mb-4" />
                  <p className="text-lg font-bold text-gray-500">
                    No locations found
                  </p>
                  <p className="text-sm text-gray-400 mt-1">
                    Try "ICT", "Library", "Cafeteria", or "Medical"
                  </p>
                </div>
              )}
            </div>
          ) : showBookmarks ? (
            // ══════════ BOOKMARKS ══════════
            <div>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-1 h-7 rounded-full bg-yellow-400" />
                <h2
                  className="text-xl font-black text-gray-900"
                  style={{ fontFamily: "'Georgia', serif" }}
                >
                  Saved Locations
                </h2>
              </div>
              {bookmarks.length > 0 ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {locations
                    .filter((l) => bookmarks.includes(l.id))
                    .map((l) => (
                      <LocationCard
                        key={l.id}
                        loc={l}
                        onBookmark={toggleBookmark}
                        bookmarked={true}
                        onSelect={setSelectedLoc}
                      />
                    ))}
                </div>
              ) : (
                <div className="text-center py-20">
                  <FaRegBookmark
                    size={48}
                    className="text-gray-300 mx-auto mb-4"
                  />
                  <p className="text-lg font-bold text-gray-500">
                    No saved locations
                  </p>
                  <p className="text-sm text-gray-400 mt-1">
                    Bookmark locations to find them quickly
                  </p>
                </div>
              )}
            </div>
          ) : (
            // ══════════ MAIN CONTENT ══════════
            <>
              {/* ── Featured Locations ── */}
              {activeCategory === "all" && (
                <div>
                  <div className="flex items-center gap-3 mb-5">
                    <div
                      className="w-1 h-7 rounded-full"
                      style={{ background: "linear-gradient(#B42225,#7C3AED)" }}
                    />
                    <h2
                      className="text-xl font-black text-gray-900"
                      style={{ fontFamily: "'Georgia', serif" }}
                    >
                      Must-Know Locations
                    </h2>
                  </div>
                  <div className="grid md:grid-cols-3 gap-5">
                    {featured.map((l) => (
                      <LocationCard
                        key={l.id}
                        loc={l}
                        onBookmark={toggleBookmark}
                        bookmarked={bookmarks.includes(l.id)}
                        onSelect={setSelectedLoc}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* ── All / Category Locations ── */}
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-1 h-7 rounded-full bg-gray-300" />
                    <h2
                      className="text-xl font-black text-gray-900"
                      style={{ fontFamily: "'Georgia', serif" }}
                    >
                      {activeCategory === "all"
                        ? "All Locations"
                        : categories.find((c) => c.key === activeCategory)
                            ?.label}
                    </h2>
                    <span className="text-sm text-gray-400">
                      ({displayLocations.length})
                    </span>
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                  {displayLocations.map((l) => (
                    <div key={l.id} className="loc-enter">
                      <LocationCard
                        loc={l}
                        onBookmark={toggleBookmark}
                        bookmarked={bookmarks.includes(l.id)}
                        onSelect={setSelectedLoc}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* ── Popular Routes ── */}
              {activeCategory === "all" && (
                <div
                  className="bg-white rounded-3xl p-6 md:p-8"
                  style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.07)" }}
                >
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-1 h-7 rounded-full"
                        style={{
                          background: "linear-gradient(#0891B2,#2563EB)",
                        }}
                      />
                      <div className="w-9 h-9 rounded-2xl bg-blue-500 flex items-center justify-center">
                        <FiNavigation size={16} className="text-white" />
                      </div>
                      <h2
                        className="text-xl font-black text-gray-900"
                        style={{ fontFamily: "'Georgia', serif" }}
                      >
                        Popular Routes
                      </h2>
                    </div>
                    <button
                      onClick={() => setShowRoutes(!showRoutes)}
                      className="text-xs font-bold text-blue-500 hover:text-blue-700 transition flex items-center gap-1"
                    >
                      {showRoutes ? "Show less" : "Show all"}{" "}
                      <FiChevronRight size={13} />
                    </button>
                  </div>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {(showRoutes
                      ? popularRoutes
                      : popularRoutes.slice(0, 4)
                    ).map((route, i) => (
                      <div
                        key={i}
                        className="bg-gray-50 rounded-2xl p-4 hover:bg-blue-50 transition-colors"
                      >
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-7 h-7 rounded-xl bg-blue-500 flex items-center justify-center shrink-0">
                            <FiNavigation size={12} className="text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[10px] text-gray-400">From</p>
                            <p className="text-xs font-black text-gray-800 truncate">
                              {route.from}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-7 h-7 rounded-xl bg-[#B42225] flex items-center justify-center shrink-0">
                            <FiMapPin size={12} className="text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[10px] text-gray-400">To</p>
                            <p className="text-xs font-black text-gray-800 truncate">
                              {route.to}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 mb-3">
                          <FiClock size={10} className="text-blue-500" />
                          <span className="text-xs font-bold text-blue-600">
                            {route.time} walk
                          </span>
                        </div>
                        <div className="space-y-1">
                          {route.steps.map((step, si) => (
                            <div key={si} className="flex items-start gap-2">
                              <span className="w-4 h-4 rounded-full bg-gray-200 text-gray-500 text-[9px] font-black flex items-center justify-center shrink-0 mt-0.5">
                                {si + 1}
                              </span>
                              <p className="text-[10px] text-gray-600 leading-snug">
                                {step}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Campus Tips ── */}
              {activeCategory === "all" && (
                <div>
                  <div className="flex items-center gap-3 mb-5">
                    <div
                      className="w-1 h-7 rounded-full"
                      style={{ background: "linear-gradient(#D97706,#F59E0B)" }}
                    />
                    <div className="w-9 h-9 rounded-2xl bg-amber-400 flex items-center justify-center">
                      <FiInfo size={16} className="text-white" />
                    </div>
                    <h2
                      className="text-xl font-black text-gray-900"
                      style={{ fontFamily: "'Georgia', serif" }}
                    >
                      Survival Tips for FUTO
                    </h2>
                  </div>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {campusTips.map((tip, i) => (
                      <div
                        key={i}
                        className="bg-white rounded-2xl p-5 hover:shadow-lg transition-shadow"
                        style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.06)" }}
                      >
                        <span className="text-2xl mb-3 block">{tip.icon}</span>
                        <h4 className="text-sm font-black text-gray-900 mb-2">
                          {tip.title}
                        </h4>
                        <p className="text-xs text-gray-500 leading-relaxed">
                          {tip.tip}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Emergency contacts banner ── */}
              {activeCategory === "all" && (
                <div
                  className="rounded-3xl p-6 md:p-8 text-white relative overflow-hidden"
                  style={{
                    background:
                      "linear-gradient(135deg,#0a0a0a 0%,#1a0a2e 50%,#B42225 100%)",
                  }}
                >
                  <div
                    className="absolute inset-0 opacity-[0.05]"
                    style={{
                      backgroundImage:
                        "radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)",
                      backgroundSize: "24px 24px",
                    }}
                  />
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-5">
                      <FiAlertCircle size={22} className="text-red-300" />
                      <h2
                        className="text-lg font-black"
                        style={{ fontFamily: "'Georgia', serif" }}
                      >
                        Emergency Contacts
                      </h2>
                    </div>
                    <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
                      {[
                        {
                          label: "Campus Security",
                          phone: "+234 803 000 0030",
                          icon: <MdSecurity size={18} />,
                          color: "bg-red-500/20 border-red-400/30",
                        },
                        {
                          label: "Medical Centre",
                          phone: "+234 803 000 0020",
                          icon: <MdOutlineMedicalServices size={18} />,
                          color: "bg-blue-500/20 border-blue-400/30",
                        },
                        {
                          label: "Student Affairs",
                          phone: "+234 803 000 0010",
                          icon: <FaUniversity size={16} />,
                          color: "bg-purple-500/20 border-purple-400/30",
                        },
                        {
                          label: "ICT Centre",
                          phone: "+234 803 000 0001",
                          icon: <FaWifi size={16} />,
                          color: "bg-green-500/20 border-green-400/30",
                        },
                      ].map(({ label, phone, icon, color }) => (
                        <a
                          key={label}
                          href={`tel:${phone}`}
                          className={`flex flex-col gap-2 p-4 rounded-2xl border backdrop-blur-sm hover:scale-105 transition-transform ${color}`}
                        >
                          <span className="text-white/70">{icon}</span>
                          <p className="text-white font-black text-sm">
                            {label}
                          </p>
                          <p className="text-white/60 text-xs">{phone}</p>
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default CampusGuidePage;
