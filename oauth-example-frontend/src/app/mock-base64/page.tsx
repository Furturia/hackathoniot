"use client";

import { useEffect, useState } from "react";

const mockImg = {
  src: "https://mock-image-url.com/fake-image.jpg", // Mock URL
  data: "iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAApgAAAKYB3X3/OAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAANCSURBVEiJtZZPbBtFFMZ/M7ubXdtdb1xSFyeilBapySVU8h8OoFaooFSqiihIVIpQBKci6KEg9Q6H9kovIHoCIVQJJCKE1ENFjnAgcaSGC6rEnxBwA04Tx43t2FnvDAfjkNibxgHxnWb2e/u992bee7tCa00YFsffekFY+nUzFtjW0LrvjRXrCDIAaPLlW0nHL0SsZtVoaF98mLrx3pdhOqLtYPHChahZcYYO7KvPFxvRl5XPp1sN3adWiD1ZAqD6XYK1b/dvE5IWryTt2udLFedwc1+9kLp+vbbpoDh+6TklxBeAi9TL0taeWpdmZzQDry0AcO+jQ12RyohqqoYoo8RDwJrU+qXkjWtfi8Xxt58BdQuwQs9qC/afLwCw8tnQbqYAPsgxE1S6F3EAIXux2oQFKm0ihMsOF71dHYx+f3NND68ghCu1YIoePPQN1pGRABkJ6Bus96CutRZMydTl+TvuiRW1m3n0eDl0vRPcEysqdXn+jsQPsrHMquGeXEaY4Yk4wxWcY5V/9scqOMOVUFthatyTy8QyqwZ+kDURKoMWxNKr2EeqVKcTNOajqKoBgOE28U4tdQl5p5bwCw7BWquaZSzAPlwjlithJtp3pTImSqQRrb2Z8PHGigD4RZuNX6JYj6wj7O4TFLbCO/Mn/m8R+h6rYSUb3ekokRY6f/YukArN979jcW+V/S8g0eT/N3VN3kTqWbQ428m9/8k0P/1aIhF36PccEl6EhOcAUCrXKZXXWS3XKd2vc/TRBG9O5ELC17MmWubD2nKhUKZa26Ba2+D3P+4/MNCFwg59oWVeYhkzgN/JDR8deKBoD7Y+ljEjGZ0sosXVTvbc6RHirr2reNy1OXd6pJsQ+gqjk8VWFYmHrwBzW/n+uMPFiRwHB2I7ih8ciHFxIkd/3Omk5tCDV1t+2nNu5sxxpDFNx+huNhVT3/zMDz8usXC3ddaHBj1GHj/As08fwTS7Kt1HBTmyN29vdwAw+/wbwLVOJ3uAD1wi/dUH7Qei66PfyuRj4Ik9is+hglfbkbfR3cnZm7chlUWLdwmprtCohX4HUtlOcQjLYCu+fzGJH2QRKvP3UNz8bWk1qMxjGTOMThZ3kvgLI5AzFfo379UAAAAASUVORK5CYII=", // Base64 data
};

// ตัวแปรสำหรับนับจำนวนครั้งที่เรียก mockFetch
let attemptCount = 0;

const mockFetch = (url) => {
  return new Promise((resolve, reject) => {
    attemptCount++;
    console.log(`Attempt: ${attemptCount}`);

    if (url === mockImg.src) {
      if (attemptCount < 3) {
        // Mock ความล้มเหลวในครั้งแรกและครั้งที่สอง
        reject(
          new Response(
            JSON.stringify({ success: false, message: "Image not found" }),
            {
              status: 404,
              statusText: "Not Found",
              headers: { "Content-Type": "application/json" },
            }
          )
        );
      } else {
        // สำเร็จในครั้งที่สาม
        resolve(
          new Response(JSON.stringify({ success: true, data: mockImg.data }), {
            status: 200,
            statusText: "OK",
            headers: { "Content-Type": "application/json" },
          })
        );
      }
    } else {
      reject(new Error("Invalid URL"));
    }
  });
};

const retry = async (fn, maxRetries, delay) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i < maxRetries - 1) {
        console.log(`Retrying... (${i + 1}/${maxRetries})`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      } else {
        throw error;
      }
    }
  }
};

const convertBase64ToBlob = async (base64Data, mimeType = "image/jpg") => {
  const binaryString = atob(base64Data);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return new Blob([bytes], { type: mimeType });
};

const Page = () => {
  const [imageBlobUrl, setImageBlobUrl] = useState(null);

  const fetchAndConvertImage = async () => {
    try {
      const response = await retry(() => mockFetch(mockImg.src), 3, 3000);

      const responseData = await response.json();
      const blob = await convertBase64ToBlob(responseData.data);

      console.log("Blob created:", blob);

      // ใช้ URL.createObjectURL เพื่อแสดงรูป
      const blobUrl = URL.createObjectURL(blob);
      setImageBlobUrl(blobUrl);

      // เรียกใช้งาน handleSuccess
      handleSuccess();
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleSuccess = () => {
    alert("Image fetched successfully!");
  };

  return (
    <div>
      <h1>Retry Mock Fetch with Delay</h1>
      <button onClick={fetchAndConvertImage}>Fetch and Display Image</button>
      {imageBlobUrl && (
        <img id="imageFromBlob" src={imageBlobUrl} alt="Generated from Blob" />
      )}
    </div>
  );
};

export default Page;
