#include "esp_camera.h"
#include <WiFi.h>
#include <ESPAsyncWebServer.h>

#define CAMERA_MODEL_AI_THINKER
#if defined(CAMERA_MODEL_WROVER_KIT)
  #define PWDN_GPIO_NUM    -1
  #define RESET_GPIO_NUM   -1
  #define XCLK_GPIO_NUM    21
  #define SIOD_GPIO_NUM    26
  #define SIOC_GPIO_NUM    27
  
  #define Y9_GPIO_NUM      35
  #define Y8_GPIO_NUM      34
  #define Y7_GPIO_NUM      39
  #define Y6_GPIO_NUM      36
  #define Y5_GPIO_NUM      19
  #define Y4_GPIO_NUM      18
  #define Y3_GPIO_NUM       5
  #define Y2_GPIO_NUM       4
  #define VSYNC_GPIO_NUM   25
  #define HREF_GPIO_NUM    23
  #define PCLK_GPIO_NUM    22

#elif defined(CAMERA_MODEL_M5STACK_PSRAM)
  #define PWDN_GPIO_NUM     -1
  #define RESET_GPIO_NUM    15
  #define XCLK_GPIO_NUM     27
  #define SIOD_GPIO_NUM     25
  #define SIOC_GPIO_NUM     23
  
  #define Y9_GPIO_NUM       19
  #define Y8_GPIO_NUM       36
  #define Y7_GPIO_NUM       18
  #define Y6_GPIO_NUM       39
  #define Y5_GPIO_NUM        5
  #define Y4_GPIO_NUM       34
  #define Y3_GPIO_NUM       35
  #define Y2_GPIO_NUM       32
  #define VSYNC_GPIO_NUM    22
  #define HREF_GPIO_NUM     26
  #define PCLK_GPIO_NUM     21

#elif defined(CAMERA_MODEL_M5STACK_WITHOUT_PSRAM)
  #define PWDN_GPIO_NUM     -1
  #define RESET_GPIO_NUM    15
  #define XCLK_GPIO_NUM     27
  #define SIOD_GPIO_NUM     25
  #define SIOC_GPIO_NUM     23
  
  #define Y9_GPIO_NUM       19
  #define Y8_GPIO_NUM       36
  #define Y7_GPIO_NUM       18
  #define Y6_GPIO_NUM       39
  #define Y5_GPIO_NUM        5
  #define Y4_GPIO_NUM       34
  #define Y3_GPIO_NUM       35
  #define Y2_GPIO_NUM       17
  #define VSYNC_GPIO_NUM    22
  #define HREF_GPIO_NUM     26
  #define PCLK_GPIO_NUM     21

#elif defined(CAMERA_MODEL_AI_THINKER)
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

// กำหนดพิน PIR Sensor และ Relay
#define PIR_SENSOR_PIN 13
#define RELAY_PIN 14

const char* ssid = "iothack";  
const char* password = "iot112233";  

// สร้าง HTTP Server
AsyncWebServer server(80);

// ฟังก์ชันสำหรับการส่งภาพกลับไปยัง client
void sendImageToClient(AsyncWebServerRequest *request, camera_fb_t *fb) {
  request->send_P(200, "image/jpeg", fb->buf, fb->len);
}

// ฟังก์ชันตรวจสอบสถานะ PIR
String checkPIRStatus() {
  int pirState = digitalRead(PIR_SENSOR_PIN);
  Serial.print("PIR State: ");  // Debug PIR state
  Serial.println(pirState);

  if (pirState == LOW) {
    return "No object detected";  // ไม่พบการเคลื่อนไหว
  } else {
    return "Object detected";  // พบการเคลื่อนไหว
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
  pinMode(PIR_SENSOR_PIN, INPUT);
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

  // ตั้งค่า HTTP Server
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

  // ตั้งค่า HTTP Server
  server.on("/pir_status", HTTP_GET, [](AsyncWebServerRequest *request){
    String status = checkPIRStatus();
    request->send(200, "text/plain", status);
  });

  server.on("/unlock", HTTP_GET, [](AsyncWebServerRequest *request){
    if (digitalRead(PIR_SENSOR_PIN) == HIGH) {
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
  // ตรวจสอบสถานะ PIR ทุกๆ 100ms
  // static unsigned long lastMillis = 0;
  // if (millis() - lastMillis >= 100) {
  //   lastMillis = millis();
  //   checkPIRStatus();  // ตรวจจับสถานะ PIR ตลอดเวลา
  // }
}
#include "esp_camera.h"
#include <WiFi.h>
#include <ESPAsyncWebServer.h>

#define CAMERA_MODEL_AI_THINKER
#if defined(CAMERA_MODEL_WROVER_KIT)
  #define PWDN_GPIO_NUM    -1
  #define RESET_GPIO_NUM   -1
  #define XCLK_GPIO_NUM    21
  #define SIOD_GPIO_NUM    26
  #define SIOC_GPIO_NUM    27
  
  #define Y9_GPIO_NUM      35
  #define Y8_GPIO_NUM      34
  #define Y7_GPIO_NUM      39
  #define Y6_GPIO_NUM      36
  #define Y5_GPIO_NUM      19
  #define Y4_GPIO_NUM      18
  #define Y3_GPIO_NUM       5
  #define Y2_GPIO_NUM       4
  #define VSYNC_GPIO_NUM   25
  #define HREF_GPIO_NUM    23
  #define PCLK_GPIO_NUM    22

#elif defined(CAMERA_MODEL_M5STACK_PSRAM)
  #define PWDN_GPIO_NUM     -1
  #define RESET_GPIO_NUM    15
  #define XCLK_GPIO_NUM     27
  #define SIOD_GPIO_NUM     25
  #define SIOC_GPIO_NUM     23
  
  #define Y9_GPIO_NUM       19
  #define Y8_GPIO_NUM       36
  #define Y7_GPIO_NUM       18
  #define Y6_GPIO_NUM       39
  #define Y5_GPIO_NUM        5
  #define Y4_GPIO_NUM       34
  #define Y3_GPIO_NUM       35
  #define Y2_GPIO_NUM       32
  #define VSYNC_GPIO_NUM    22
  #define HREF_GPIO_NUM     26
  #define PCLK_GPIO_NUM     21

#elif defined(CAMERA_MODEL_M5STACK_WITHOUT_PSRAM)
  #define PWDN_GPIO_NUM     -1
  #define RESET_GPIO_NUM    15
  #define XCLK_GPIO_NUM     27
  #define SIOD_GPIO_NUM     25
  #define SIOC_GPIO_NUM     23
  
  #define Y9_GPIO_NUM       19
  #define Y8_GPIO_NUM       36
  #define Y7_GPIO_NUM       18
  #define Y6_GPIO_NUM       39
  #define Y5_GPIO_NUM        5
  #define Y4_GPIO_NUM       34
  #define Y3_GPIO_NUM       35
  #define Y2_GPIO_NUM       17
  #define VSYNC_GPIO_NUM    22
  #define HREF_GPIO_NUM     26
  #define PCLK_GPIO_NUM     21

#elif defined(CAMERA_MODEL_AI_THINKER)
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

// กำหนดพิน PIR Sensor และ Relay
#define PIR_SENSOR_PIN 13
#define RELAY_PIN 14

const char* ssid = "iothack";  
const char* password = "iot112233";  

// สร้าง HTTP Server
AsyncWebServer server(80);

// ฟังก์ชันสำหรับการส่งภาพกลับไปยัง client
void sendImageToClient(AsyncWebServerRequest *request, camera_fb_t *fb) {
  request->send_P(200, "image/jpeg", fb->buf, fb->len);
}

// ฟังก์ชันตรวจสอบสถานะ PIR
String checkPIRStatus() {
  int pirState = digitalRead(PIR_SENSOR_PIN);
  Serial.print("PIR State: ");  // Debug PIR state
  Serial.println(pirState);

  if (pirState == LOW) {
    return "No object detected";  // ไม่พบการเคลื่อนไหว
  } else {
    return "Object detected";  // พบการเคลื่อนไหว
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
  pinMode(PIR_SENSOR_PIN, INPUT);
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

  // ตั้งค่า HTTP Server
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

  // ตั้งค่า HTTP Server
  server.on("/pir_status", HTTP_GET, [](AsyncWebServerRequest *request){
    String status = checkPIRStatus();
    request->send(200, "text/plain", status);
  });

  server.on("/unlock", HTTP_GET, [](AsyncWebServerRequest *request){
    if (digitalRead(PIR_SENSOR_PIN) == HIGH) {
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
  // ตรวจสอบสถานะ PIR ทุกๆ 100ms
  // static unsigned long lastMillis = 0;
  // if (millis() - lastMillis >= 100) {
  //   lastMillis = millis();
  //   checkPIRStatus();  // ตรวจจับสถานะ PIR ตลอดเวลา
  // }
}
