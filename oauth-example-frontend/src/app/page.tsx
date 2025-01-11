"use client";
import { useState, useEffect } from "react";
import { environment } from "./env";
import PrivacyPolicyModal from "./components/PrivacyPolicyModal";
import icon from "@/app/icons/sit.png";
const Home = () => {
  const [showButton, setShowButton] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowButton(true);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleRedirect = async () => {
    if (typeof window !== "undefined") {
      location.href = `${environment.backend_url}/api/public/login/redirect`;
    }
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-white text-black transition-all duration-500">
      {/* Modal */}
      {showModal && (
        <PrivacyPolicyModal
          onSubmit={() => handleRedirect()}
          onConsent={() => setShowModal(false)}
        />
      )}

      {/* Main Content */}
      <section className="flex flex-col items-center justify-center text-center gap-6 px-4">
        <h1
          className={`font-bold text-5xl transition-transform duration-1000 ${
            showButton
              ? "translate-y-0 opacity-100"
              : "translate-y-10 opacity-0"
          }`}
        >
          Welcome to Auth Door
        </h1>
        <p
          className={`text-lg max-w-xl text-gray-500 transition-opacity duration-1000 delay-300 ${
            showButton ? "opacity-100" : "opacity-0"
          }`}
        >
          กรุณาล็อกอิน ด้วยบัญชี @ad.sit.kmutt.ac.th{" "}
        </p>
        <div
          className={`transition-opacity duration-1000 delay-500 ${
            showButton
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-10"
          }`}
        >
          <button
            className="bg-black hover:bg-gray-800 text-white font-semibold py-3 px-6 rounded-full shadow-lg transition-all duration-300"
            onClick={() => setShowModal(true)}
            disabled={showModal}
          >
            Sign in With KMUTT Account
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="absolute bottom-0 left-0 w-full text-center py-6 text-gray-500 text-sm">
        <div className=" w-full flex justify-center items-center px-6 py-4">
          <img className="max-w-[20rem]" src={icon.src} alt="" />
        </div>
        © 2025 Auth Door. All rights reserved.
      </footer>
    </main>
  );
};

export default Home;
