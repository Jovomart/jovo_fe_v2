"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect, useContext } from "react";
import { AuthContext } from "@/context/AuthContext";
import {
  FiCheck,
  FiArrowRight,
  FiChevronRight,
  FiUpload,
  FiPackage,
  FiTrendingUp,
  FiDollarSign,
  FiShield,
  FiUsers,
  FiBarChart2,
  FiStar,
  FiZap,
  FiClock,
  FiGlobe,
  FiSmartphone,
  FiHeadphones,
  FiAward,
  FiBriefcase,
} from "react-icons/fi";
import {
  FaStore,
  FaWhatsapp,
  FaCheckCircle,
  FaBoxOpen,
  FaChartLine,
  FaHandshake,
  FaRocket,
  FaRegStar,
} from "react-icons/fa";
import {
  MdVerified,
  MdStorefront,
  MdOutlineInventory2,
  MdPayment,
  MdSupportAgent,
  MdCampaign,
} from "react-icons/md";
import {
  GiTShirt,
  GiElectric,
  GiCoffeeCup,
  GiLipstick,
  GiBookCover,
  GiSofa,
  GiComputerFan,
} from "react-icons/gi";
import {
  BsTools,
  BsWrench,
  BsBrush,
  BsMusicNote,
  BsCamera,
} from "react-icons/bs";

export default function BecomeServiceProvider() {
  const router = useRouter();
  const { user, isServiceProvider } = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isServiceProvider) {
      router.push("/service-dashboard");
    }
  }, [isServiceProvider, router]);

  const handleApply = async () => {
    if (!user) {
      router.push("/login");
      return;
    }
    setIsLoading(true);
    // Simulate application process
    setTimeout(() => {
      setIsLoading(false);
      router.push("/seller-application");
    }, 2000);
  };

  const benefits = [
    {
      icon: <FiDollarSign className="w-6 h-6" />,
      title: "Earn Extra Income",
      desc: "Turn your skills into earnings on campus",
    },
    {
      icon: <FiUsers className="w-6 h-6" />,
      title: "Build Your Network",
      desc: "Connect with students and grow your client base",
    },
    {
      icon: <FiClock className="w-6 h-6" />,
      title: "Flexible Hours",
      desc: "Work on your own schedule",
    },
    {
      icon: <FiAward className="w-6 h-6" />,
      title: "Get Verified",
      desc: "Build trust with verified service provider status",
    },
  ];

  const services = [
    {
      icon: <BsTools className="w-5 h-5" />,
      name: "Repairs & Maintenance",
      desc: "Fix electronics, appliances, bikes",
    },
    {
      icon: <BsWrench className="w-5 h-5" />,
      name: "Home Services",
      desc: "Cleaning, plumbing, electrical",
    },
    {
      icon: <BsBrush className="w-5 h-5" />,
      name: "Creative Services",
      desc: "Graphic design, photography, writing",
    },
    {
      icon: <BsMusicNote className="w-5 h-5" />,
      name: "Tutoring",
      desc: "Academic help, music lessons",
    },
    {
      icon: <BsCamera className="w-5 h-5" />,
      name: "Event Services",
      desc: "Photography, DJ, catering",
    },
  ];

  const steps = [
    {
      step: "1",
      title: "Create Your Profile",
      desc: "Set up your service provider account with your skills and experience",
    },
    {
      step: "2",
      title: "Get Verified",
      desc: "Complete our verification process to build trust with clients",
    },
    {
      step: "3",
      title: "Start Offering Services",
      desc: "List your services and start receiving bookings",
    },
    {
      step: "4",
      title: "Grow Your Business",
      desc: "Build reviews, expand services, and increase your earnings",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-full p-4">
                <FiBriefcase className="w-12 h-12" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Become a Service Provider
            </h1>
            <p className="text-xl text-purple-100 max-w-2xl mx-auto mb-8">
              Turn your skills into income. Offer services to fellow students
              and earn money doing what you love.
            </p>
            <button
              onClick={handleApply}
              disabled={isLoading}
              className="inline-flex items-center gap-3 bg-white text-purple-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
                  Applying...
                </>
              ) : (
                <>
                  Apply Now
                  <FiArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Become a Service Provider?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Join thousands of students who are earning extra income by
              offering their skills and services.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="text-center">
                <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <div className="text-purple-600">{benefit.icon}</div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {benefit.title}
                </h3>
                <p className="text-gray-600">{benefit.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Services Section */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Popular Services
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Students are looking for these services. What skills do you have?
            </p>
          </div>
          <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-6">
            {services.map((service, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow text-center"
              >
                <div className="bg-purple-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                  <div className="text-purple-600">{service.icon}</div>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  {service.name}
                </h3>
                <p className="text-sm text-gray-600">{service.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Getting started is easy. Follow these simple steps to become a
              verified service provider.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="text-center">
                <div className="bg-purple-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-lg">
                  {step.step}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {step.title}
                </h3>
                <p className="text-gray-600">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Earning?</h2>
          <p className="text-xl text-purple-100 mb-8">
            Join our community of service providers and start building your
            business today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleApply}
              disabled={isLoading}
              className="inline-flex items-center justify-center gap-3 bg-white text-purple-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
                  Applying...
                </>
              ) : (
                <>
                  Apply to Become a Service Provider
                  <FiArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-3 border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-purple-600 transition-colors"
            >
              Learn More
              <FiChevronRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
