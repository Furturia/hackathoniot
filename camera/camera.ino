#include "esp_camera.h"
#include <WiFi.h>
#include <ESPAsyncWebServer.h>

#define CAMERA_MODEL_AI_THINKER
// ส่วนที่เหลือของการกำหนดพินกล้องเหมือนเดิม

// กำหนดพินสำหรับ Ultrasonic Sensor
#define TRIG_PIN 12  // พิน Trigger
#define ECHO_PIN 13  // พิน Echo

const char* ssid = "iothack";  
const char* password = "iot112233";  

// สร้าง HTTP Server
AsyncWebServer server(80);

// ฟังก์ชันสำหรับการวัดระยะทางจาก Ultrasonic Sensor
long measureDistance() {
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);
  
  long duration = pulseIn(ECHO_PIN, HIGH);
  long distance = (duration / 2) / 29.1;  // คำนวณระยะทาง (ในเซนติเมตร)
  
  return distance;
}

// ฟังก์ชันตรวจสอบระยะห่างจาก Ultrasonic Sensor
String checkDistance() {
  long distance = measureDistance();
  Serial.print("Distance: ");
  Serial.println(distance);
  
  if (distance < 50) {  // ถ้าระยะห่างน้อยกว่า 50 cm
    return "Object detected";  // พบวัตถุ
  } else {
    return "No object detected";  // ไม่มีวัตถุ
  }
}

// ฟังก์ชันควบคุม Relay
void unlockDoor() {
  digitalWrite(RELAY_PIN, HIGH);  // เปิดกลอน
  delay(1000);  // รอ 1 วินาที
  yield();  // ให้ระบบทำงานต่อไป
  digitalWrite(RELAY_PIN, LOW);  // ปิดกลอน
}

void setup() {
  Serial.begin(115200);

  // ตั้งค่า PIN Mode
  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);
  pinMode(RELAY_PIN, OUTPUT);
  digitalWrite(RELAY_PIN, LOW);  // เริ่มต้นปิด Relay

  // เชื่อมต่อ WiFi
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.println("Connecting to WiFi...");
  }
  Serial.println("Connected to WiFi");
  Serial.print("Local IP Address: ");
  Serial.println(WiFi.localIP());

  // ตั้งค่ากล้อง
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
  config.pin_sccb_sda = SIOD_GPIO_NUM;
  config.pin_sccb_scl = SIOC_GPIO_NUM;
  config.pin_pwdn = PWDN_GPIO_NUM;
  config.pin_reset = RESET_GPIO_NUM;
  config.xclk_freq_hz = 20000000;
  config.pixel_format = PIXFORMAT_JPEG;

  if(psramFound()){
    config.frame_size = FRAMESIZE_UXGA;
    config.jpeg_quality = 10;
    config.fb_count = 2;
  } else {
    config.frame_size = FRAMESIZE_SVGA;
    config.jpeg_quality = 12;
    config.fb_count = 1;
  }

  // Camera init
  esp_err_t err = esp_camera_init(&config);
  if (err != ESP_OK) {
    Serial.printf("Camera init failed with error 0x%x", err);
    return;
  }

  // ตั้งค่า HTTP Server สำหรับการวัดระยะจาก Ultrasonic Sensor
  server.on("/start_motion", HTTP_GET, [](AsyncWebServerRequest *request){
    camera_fb_t *fb = esp_camera_fb_get();
    if(!fb) {
      Serial.println("Camera capture failed");
      delay(1000);
      ESP.restart();
    }
    Serial.println("Image captured successfully");

    // ส่งภาพกลับไปยัง client
    sendImageToClient(request, fb);

    // คืนค่าหน่วยความจำหลังใช้งาน
    esp_camera_fb_return(fb);
  });

  server.on("/distance_status", HTTP_GET, [](AsyncWebServerRequest *request){
    String status = checkDistance();
    request->send(200, "text/plain", status);
  });

  server.on("/unlock", HTTP_GET, [](AsyncWebServerRequest *request){
    if (measureDistance() < 20) {  // ถ้าระยะห่างน้อยกว่า 20 cm
      unlockDoor();
      request->send(200, "text/plain", "Door unlocked!");
    } else {
      request->send(400, "text/plain", "No object detected. Cannot unlock door.");
    }
  });

  // เริ่มต้น HTTP Server
  server.begin();
}

void loop() {
  // ไม่มีการใช้งานใน loop เนื่องจากเราใช้ HTTP Server เพื่อตรวจสอบสถานะ
}
