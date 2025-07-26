# Dumbledoor - IoT Hackathon 🧙‍♂️🔐

**Dumbledoor** is an innovative project born from the **IOT Hackathon**, aimed at integrating a web application with real-world hardware to solve everyday problems through technology.

## 🏆 Achievement

**🥈 1st Runner-up Award**  
Our team proudly won **1st Runner-up** in the IoT Hackathon competition — a testament to our creativity, teamwork, and problem-solving approach to real-world challenges.

## 🔍 Project Background

Inspired by a common inconvenience at our faculty building—where access requires a student ID card—we envisioned a smarter, more seamless solution. Often, students forget their cards and must wait for someone to open the door, causing delays and frustration.

To solve this, we created an **automated door access system** using IoT technology and a secure web platform. This system ensures both **convenience** and **security**, leveraging familiar tools and devices.

## 🚪 How It Works

1. **Scan QR Code** at the door.
2. The QR code redirects to our **custom login page**.
3. Users **log in with a faculty-authorized email**.
4. Once authenticated:
   - The **ESP32-CAM** captures an image for access history.
   - The system **logs access details** to the database.
   - The **door unlocks** automatically via the solenoid lock.

This provides a contactless, cardless, and secure method of access that improves both user experience and administrative monitoring.

## 🧰 Tech Stack

### 💻 Software
- **Frontend:** React (TypeScript)
- **Backend:** Golang
- **Database:** MySQL
- **Hardware:** C++

### 🔩 Hardware
- NodeMCU **ESP8266**
- **ESP32-CAM**
- **1.8 Inch ST7735 TFT LCD Module** (128×160, 4 IO)
- **12V Solenoid Lock**
- **5V Relay Module**
- **5V PIR Sensor**

## 🌟 Why "Dumbledoor"?

A play on the beloved character *Dumbledore* and the word *door*, symbolizing our magical (but very real) way of opening doors through smart technology.

---

> 🛠️ Built with passion, teamwork, and a shared mission to make everyday life smarter — one door at a time.
