#include <TFT_eSPI.h>  
#include <qrcode.h>    

TFT_eSPI tft = TFT_eSPI(); 
QRCode qrcode;

void setup() {
  tft.init();
  tft.setRotation(1); 
  tft.fillScreen(TFT_BLACK); 

  const char* url = "http://authdoor-frontend.scnd.space/";
  uint8_t qrcodeData[qrcode_getBufferSize(3)];
  qrcode_initText(&qrcode, qrcodeData, 3, ECC_LOW, url);

  int qrSize = 4; 
  int offsetX = (tft.width() - (qrcode.size * qrSize)) / 2;
  int offsetY = (tft.height() - (qrcode.size * qrSize)) / 2;

  for (int y = 0; y < qrcode.size; y++) {
    for (int x = 0; x < qrcode.size; x++) {
      if (qrcode_getModule(&qrcode, x, y)) {
        tft.fillRect(offsetX + x * qrSize, offsetY + y * qrSize, qrSize, qrSize, TFT_WHITE);
      } else {
        tft.fillRect(offsetX + x * qrSize, offsetY + y * qrSize, qrSize, qrSize, TFT_BLACK);
      }
    }
  }
}

void loop() {
}