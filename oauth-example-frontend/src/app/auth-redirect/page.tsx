"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { environment } from "../env";
import { useEffect, useState } from "react";
import mockImg from "./mock-img/1234.png";
import Loader from "../components/Loading";
import Loader2 from "../components/Loading2";
import Swal from "sweetalert2";

const AuthRedirectPage = () => {
  const navigator = useRouter();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(true);
  const [loading2, setLoading2] = useState(false);
  const [inputOtp, setInputOtp] = useState("");
  const [resendAvailable, setResendAvailable] = useState(false);
  const [timer, setTimer] = useState(60);
  const [role, setRole] = useState(""); // เพิ่ม state สำหรับ role
  const code = useSearchParams()?.get("code");

  const fetchProfile = async () => {
    if (!code) {
      console.error("Code parameter is missing.");
      return;
    }

    const formData = new FormData();
    formData.append("code", code);

    const res = await fetch(`${environment.backend_url}/api/profile`, {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    setEmail(data?.email);
    setUserId(data?.user_id);
    setRole(data?.role); // กำหนด role ตามที่ได้รับจาก API

    if (data?.role === "std") {
      handleSendOTP();
    }
    setLoading(false);
    console.log(data);

    return data;
  };

  const handleCallback = async () => {
    const formData = new FormData();
    formData.append("user_id", userId);

    const filePath = mockImg.src;
    const response = await fetch(filePath);
    const blob = await response.blob();

    formData.append("image", blob, `${generateRandomSixDigits()}.jpg`);

    const res = await fetch(
      `${environment.backend_url}/api/public/login/callback`,
      {
        method: "POST",
        body: formData,
        credentials: "include",
      }
    );

    if (res.ok) {
      navigator.push("/"); // ไปที่หน้าหลักเมื่อสำเร็จ
    } else {
      console.error("Failed to send callback:", res.status, res.statusText);
    }
  };

  function generateRandomSixDigits(): string {
    const randomNum = Math.floor(Math.random() * 1000000);
    return randomNum.toString().padStart(6, "0");
  }

  const handleSendOTP = async () => {
    if (email) {
      const randOTP = generateRandomSixDigits();
      setOtp(randOTP);

      const resOTP = await fetch(`${environment.backend_url}/api/email/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: email,
          mess: "รหัส OTP ของคุณคือ " + randOTP,
        }),
      });

      console.log(resOTP);
    }
  };

  const handleVerifyOTP = (event: React.FormEvent) => {
    event.preventDefault();

    setLoading2(true);

    if (inputOtp === otp) {
      Swal.fire({
        icon: "success",
        title: "Success",
        text: "กำลังกลับสู่หน้าหลัก...",
      });
      handleCallback();
      setLoading2(false);
    } else {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "รหัสยืนยันตัวตนไม่ถูกต้อง!",
      });
      setLoading2(false);
    }
  };

  const handleResendOTP = async () => {
    if (!code || !resendAvailable) return;

    const newOtp = generateRandomSixDigits();
    setOtp(newOtp);

    const resOTP = await fetch(`${environment.backend_url}/api/email/send`, {
      method: "POST",
      body: JSON.stringify({
        to: email,
        mess: "รหัส OTP ของคุณคือ " + newOtp,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (resOTP.ok) {
      console.log("OTP resent successfully");
      setResendAvailable(false);
      setTimer(60);
    } else {
      console.error("Failed to resend OTP");
    }
  };

  useEffect(() => {
    fetchProfile();

    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setResendAvailable(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // แสดง UI ตาม role
  return loading ? (
    <Loader />
  ) : role === "admin" ? (
    <div>
      <p className="text-slate-500">คุณเป็น admin</p>
      <button
        onClick={() => {
          handleSendOTP();
          setRole("");
        }}
        className="w-full inline-flex justify-center rounded-lg bg-indigo-500 px-3.5 py-2.5 text-sm font-medium text-white"
      >
        Send OTP
      </button>
      <button
        onClick={() => navigator.push("/dashboard")}
        className="w-full inline-flex justify-center mt-4 rounded-lg bg-green-500 px-3.5 py-2.5 text-sm font-medium text-white"
      >
        Go to Dashboard
      </button>
    </div>
  ) : (
    <div className="max-w-full mx-auto text-center bg-white px-4 sm:px-8 py-10 rounded-xl mt-20">
      <header className="mb-8">
        <h1 className="text-2xl font-bold mb-1">OTP Verification</h1>
        <p className="text-[15px] text-slate-500">
          Enter the 6-digit verification code that was sent to your {email}.
        </p>
      </header>
      <form onSubmit={handleVerifyOTP}>
        <div className="flex items-center justify-center gap-3">
          <input
            type="text"
            className="w-96 h-14 text-center text-2xl font-extrabold text-slate-900 bg-slate-100 border border-transparent hover:border-slate-200 appearance-none rounded p-4 outline-none focus:bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
            pattern="\d*"
            onInput={(e: any) => setInputOtp(e.target.value)}
            maxLength={6}
          />
        </div>
        <div className="max-w-[260px] mx-auto mt-4">
          <button
            type="submit"
            className="w-full inline-flex justify-center rounded-lg bg-indigo-500 px-3.5 py-2.5 text-sm font-medium text-white"
          >
            Verify Account
          </button>
        </div>
      </form>
      <div className="text-sm text-slate-500 mt-4">
        Didn't receive code?{" "}
        <button
          className={`font-medium text-indigo-500 hover:text-indigo-600 ${
            !resendAvailable && "cursor-not-allowed opacity-50"
          }`}
          onClick={handleResendOTP}
          disabled={!resendAvailable}
        >
          {resendAvailable ? "Resend" : `Resend in ${timer}s`}
        </button>
      </div>
      {loading2 && <Loader2 />}
    </div>
  );
};

export default AuthRedirectPage;
