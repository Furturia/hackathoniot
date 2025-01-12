"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { environment } from "../env";
import { useEffect, useState } from "react";
import Loader from "../components/Loading";
import Loader2 from "../components/Loading2";
import Swal from "sweetalert2";
import { convertBase64ToBlob } from "./covertBase64ToBlob";

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

  const ConvertBase64ToBlob = async (base64: string) => {
    const res = await convertBase64ToBlob(base64);
    return res;
  };

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
    setRole(data?.role);

    if (data?.role === "std" && data?.email) {
      console.log("Sending OTP to:", data.email);
      await handleSendOTP(data.email);
    }

    setLoading(false);
    console.log(data);

    return data;
  };

  const handleCallback = async () => {
    try {
      setLoading2(true);
      const formData = new FormData();
      formData.append("user_id", userId);

      try {
        const responsePir = await fetch(
          `${environment.backend_url}/api/sensor/getdis`
        );
        const dataPir = await responsePir.json();

        if (dataPir.data == "No object detected") {
          formData.append("status", "false");

          await fetch(`${environment.backend_url}/api/public/login/callback`, {
            method: "POST",
            body: formData,
            credentials: "include",
          });

          await Swal.fire({
            icon: "error",
            title: "ไม่สามารถเข้าใช้งานได้",
            text: "คุณไม่ได้อยู่ในบริเวณที่สามารถเข้าใช้งานได้",
            confirmButtonText: "รับทราบ",
          });

          navigator.push("/");
          return;
        }

        const response = await fetch(
          `${environment.backend_url}/api/sensor/get`
        );

        const data = await response.json();

        const blob = await ConvertBase64ToBlob(data.data);

        if (blob.size === 0) {
          throw new Error("Empty blob received");
        }

        const fileName = `${generateRandomSixDigits()}.jpg`;
        formData.append("image", blob, fileName);

        formData.append("status", "true");

        const res = await fetch(
          `${environment.backend_url}/api/public/login/callback`,
          {
            method: "POST",
            body: formData,
            credentials: "include",
          }
        );

        if (res.ok) {
          Swal.close();

          await fetch(`${environment.backend_url}/api/sensor/unlock`);
          await Swal.fire({
            icon: "success",
            title: "ปลดล็อกประตูแล้ว",
          });
          navigator.push("/");
        } else {
          const errorData = await res.json().catch(() => null);
          throw new Error(
            `API Error: ${res.status} ${res.statusText} ${
              errorData ? JSON.stringify(errorData) : ""
            }`
          );
        }
      } catch (error) {
        console.error("Error in callback process:", error);
        await Swal.fire({
          icon: "error",
          title: "เกิดข้อผิดพลาด",
          confirmButtonText: "ตกลง",
        });
        navigator.push("/");
        throw error;
      }
    } catch (error) {
      console.error("Fatal error in handleCallback:", error);
    } finally {
      setLoading2(false);
    }
  };

  function generateRandomSixDigits(): string {
    const randomNum = Math.floor(Math.random() * 1000000);
    return randomNum.toString().padStart(6, "0");
  }

  const handleSendOTP = async (emailParam: string) => {
    if (!emailParam && !email) {
      console.error("Email is required for sending OTP");
      return;
    }

    const randOTP = generateRandomSixDigits();
    setOtp(randOTP);

    try {
      const resOTP = await fetch(`${environment.backend_url}/api/email/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: emailParam || email,
          mess: "รหัส OTP ของคุณคือ " + randOTP,
        }),
      });

      if (!resOTP.ok) {
        throw new Error(`Failed to send OTP: ${resOTP.status}`);
      }

      console.log("OTP sent successfully");
    } catch (error) {
      console.error("Error sending OTP:", error);
    }
  };

  const handleVerifyOTP = async (event: React.FormEvent) => {
    event.preventDefault();

    setLoading(true);
    // setLoading2(true);
    Swal.fire({
      title: "Verifying...",
      text: "Please wait while we verify your OTP.",
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    if (inputOtp === otp) {
      await handleCallback();
    } else {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "รหัสยืนยันตัวตนไม่ถูกต้อง!",
      });
      // setLoading2(false);
      setLoading(false);
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

      const newInterval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            clearInterval(newInterval);
            setResendAvailable(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
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

  return loading ? (
    <Loader />
  ) : role === "admin" ? (
    <div>
      <p className="text-slate-500">คุณเป็น admin</p>
      <button
        onClick={() => {
          handleSendOTP(email);
          setRole("");
        }}
        className="w-full inline-flex justify-center rounded-lg bg-indigo-500 px-3.5 py-2.5 text-sm font-medium text-white"
      >
        auth door
      </button>
      <button
        onClick={() =>
          navigator.push("/dashboard?source=auth-redirect&id=" + userId)
        }
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
