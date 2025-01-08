"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { environment } from "../env";
import { useEffect } from "react";
import mockImg from "./mock-img/1234.png";

const AuthRedirectPage = () => {
  const navigator = useRouter();
  const code = useSearchParams()?.get("code");

  const handleCallback = async () => {
    if (!code) {
      console.error("Code parameter is missing.");
      return; // Exit early if code is missing
    }
    // สร้าง FormData
    const formData = new FormData();
    formData.append("code", code);

    const filePath = mockImg.src; 
    const response = await fetch(filePath);
    const blob = await response.blob();

    // เพิ่มไฟล์ใน FormData
    formData.append("image", blob, "12345.jpg");

    // ส่ง request ไปที่ backend
    const res = await fetch(
      `${environment.backend_url}/api/public/login/callback`,
      {
        method: "POST",
        body: formData,
        credentials: "include",
      }
    );

    if (res.ok) {
      const data = await res.json();
      console.log(data);
    } else {
      console.error("Failed to send callback:", res.status, res.statusText);
    }
  };

  useEffect(() => {
    handleCallback();
  }, []);

  return (
    <div>
      <h1>Login Successful!!. . . and save logging</h1>
    </div>
  );
};

export default AuthRedirectPage;
