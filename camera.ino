#include "esp_camera.h"
#include <WiFi.h>
#include <HTTPClient.h>
// #include <WebServer.h>
#include "Arduino.h"
#include "soc/soc.h" // Disable brownout problems
#include "soc/rtc_cntl_reg.h" // Disable brownout problems

// Replace with your network credentials
const char* ssid = "SIT-IIoT"; // WiFi SSID
const char* password = "Sit1To#Down!9"; // WiFi Password

// URL สำหรับอัปโหลดรูปภาพไปยังฐานข้อมูล
const char* upload_url = "http://most-mqtt-server.scnd.space";

#define CAMERA_MODEL_AI_THINKER
#if defined(CAMERA_MODEL_AI_THINKER)
  #define PWDN_GPIO_NUM     32
  #define RESET_GPIO_NUM    -1
  #define XCLK_GPIO_NUM      0
  #define SIOD_GPIO_NUM     26
  #define SIOC_GPIO_NUM     27
  #define Y9_GPIO_NUM       35
  #define Y8_GPIO_NUM       34
  #define Y7_GPIO_NUM       39
  #define Y6_GPIO_NUM       36
  #define Y5_GPIO_NUM       21
  #define Y4_GPIO_NUM       19
  #define Y3_GPIO_NUM       18
  #define Y2_GPIO_NUM        5
  #define VSYNC_GPIO_NUM    25
  #define HREF_GPIO_NUM     23
  #define PCLK_GPIO_NUM     22
#else
  #error "Camera model not selected"
#endif

void captureAndUpload() {
  camera_fb_t* fb = esp_camera_fb_get();
  if (!fb) {
    Serial.println("Camera capture failed");
    return;
  }

  // Print basic details about the captured image
  Serial.println("Camera capture successful!");
  Serial.printf("Image size: %d bytes\n", fb->len);

  // Print binary representation of the image (limited to 64 bytes for readability)
  Serial.println("Binary data of the image (first 64 bytes):");
  for (int i = 0; i < min((size_t)64, fb->len); i++) {
    for (int bit = 7; bit >= 0; bit--) {
      Serial.print((fb->buf[i] >> bit) & 1); // Extract and print each bit
    }
    Serial.print(" "); // Add a space between bytes
    if ((i + 1) % 8 == 0) Serial.println(); // Break line after 8 bytes
  }
  Serial.println();

  HTTPClient http;
  http.begin(upload_url);
  http.addHeader("Content-Type", "application/octet-stream");

  int httpResponseCode = http.POST(fb->buf, fb->len);

  if (httpResponseCode > 0) {
    Serial.printf("Image uploaded successfully, HTTP Response: %d\n", httpResponseCode);
  } else {
    Serial.printf("Failed to upload image, HTTP Response: %d\n", httpResponseCode);
  }

  http.end();
  esp_camera_fb_return(fb);
}


void setup() {
  WRITE_PERI_REG(RTC_CNTL_BROWN_OUT_REG, 0); // Disable brownout detector

  Serial.begin(115200);
  Serial.setDebugOutput(false);

  Serial.println("Connecting to WiFi...");
  WiFi.begin(ssid, password);

  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) { // ลองเชื่อมต่อสูงสุด 20 ครั้ง
    delay(500);
    Serial.print(".");
    attempts++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\nWiFi connected successfully");
    Serial.print("Device IP: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("\nFailed to connect to WiFi");
    Serial.println("Please check SSID and password");
    // ออกจากฟังก์ชัน setup ถ้าเชื่อมต่อ WiFi ไม่ได้
    return;
  }

  camera_config_t config;
  config.ledc_channel = LEDC_CHANNEL_0;
  config.ledc_timer = LEDC_TIMER_0;
  config.pin_d0 = Y2_GPIO_NUM;
  config.pin_d1 = Y3_GPIO_NUM;
  config.pin_d2 = Y4_GPIO_NUM;
  config.pin_d3 = Y5_GPIO_NUM;
  config.pin_d4 = Y6_GPIO_NUM;
  config.pin_d5 = Y7_GPIO_NUM;
  config.pin_d6 = Y8_GPIO_NUM;
  config.pin_d7 = Y9_GPIO_NUM;
  config.pin_xclk = XCLK_GPIO_NUM;
  config.pin_pclk = PCLK_GPIO_NUM;
  config.pin_vsync = VSYNC_GPIO_NUM;
  config.pin_href = HREF_GPIO_NUM;
  config.pin_sscb_sda = SIOD_GPIO_NUM;
  config.pin_sscb_scl = SIOC_GPIO_NUM;
  config.pin_pwdn = PWDN_GPIO_NUM;
  config.pin_reset = RESET_GPIO_NUM;
  config.xclk_freq_hz = 20000000;
  config.pixel_format = PIXFORMAT_JPEG;

  if (psramFound()) {
    config.frame_size = FRAMESIZE_UXGA;
    config.jpeg_quality = 10;
    config.fb_count = 2;
  } else {
    config.frame_size = FRAMESIZE_SVGA; 
    config.jpeg_quality = 12;
    config.fb_count = 1;
  }

  esp_err_t err = esp_camera_init(&config);
  if (err != ESP_OK) {
    Serial.printf("Camera init failed with error 0x%x\n", err);
    return;
  }

  Serial.println("Camera initialized successfully");
}

void loop() {
  if (WiFi.status() == WL_CONNECTED) {
    captureAndUpload(); // ถ่ายภาพและอัปโหลด
  } else {
    Serial.println("WiFi disconnected, trying to reconnect...");
    WiFi.reconnect();
  }
  delay(10000); // รอ 10 วินาทีก่อนถ่ายภาพครั้งถัดไป
}
