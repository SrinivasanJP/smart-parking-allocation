
#include <Arduino.h>
#include <WiFi.h>
#include <Firebase_ESP_Client.h>
//Provide the token generation process info.
#include "addons/TokenHelper.h"
//Provide the RTDB payload printing info and other helper functions.
#include "addons/RTDBHelper.h"
#include <SPI.h>
#include <MFRC522.h>

#include "SevSeg.h"
#include <ESP32Servo.h>




//RFID pins
#define SS_PIN 21
#define RST_PIN 22

#define SERVO_PIN 26

// Constants TODO: Split env constants to the separate file
// Insert your network credentials
#define WIFI_SSID "Mi A3"
#define WIFI_PASSWORD "1234567890"
// Insert Firebase project API Key
#define API_KEY "AIzaSyAJV8hpZ-hNij0PCy6mh_6VbGBngwZqqoU"
// Insert RTDB URLefine the RTDB URL */
#define DATABASE_URL "https://smart-parking-allocation-default-rtdb.asia-southeast1.firebasedatabase.app/"
//Define Firebase Data object
FirebaseData fbdo;
FirebaseAuth auth;
FirebaseConfig config;

MFRC522 rfid(SS_PIN, RST_PIN);
MFRC522::MIFARE_Key key;
byte nuidPICC[4];
String currentCard;
SevSeg sevseg;  //Initiate a seven segment controller object
Servo myservo;  // create servo object to control a servo

struct slot {
  int id;
  int UID_User;
  bool isReserved;
} typedef s;


int swevo_pos = 0;
unsigned long sendDataPrevMillis = 0;
bool signupOK = false;
std::vector<String> data;
int currentSlot = 1000;
bool displayNeedsUpdate = false;
unsigned long lastRefreshTime = 0;
void servoInit() {
  myservo.setPeriodHertz(50);  // standard 50 hz servo
  myservo.attach(SERVO_PIN, 500, 2400);
}

// Task handles for FreeRTOS tasks
TaskHandle_t dataRetrievalTaskHandle = NULL;
TaskHandle_t cardDetectionTaskHandle = NULL;

void SevSegInit() {
  byte numDigits = 4;
  byte digitPins[] = { 5, 15, 2, 4 };
  byte segmentPins[] = { 27, 32, 14, 33, 25, 13, 12 };
  bool resistorsOnSegments = 0;
  // variable above indicates that 4 resistors were placed on the digit pins.
  // set variable to 1 if you want to use 8 resistors on the segment pins.
  sevseg.begin(COMMON_CATHODE, numDigits, digitPins, segmentPins, resistorsOnSegments);
  sevseg.setBrightness(90);
}
void wifiInit() {
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("Connecting to Wi-Fi: ");
  Serial.println(WIFI_SSID);

  // Wait for connection
  int retryCount = 0;
  while (WiFi.status() != WL_CONNECTED) {
    Serial.print(".");
    delay(500);
    retryCount++;
    if (retryCount >= 20) {  // Adjust retry count if needed
      Serial.println();
      Serial.println("Failed to connect to Wi-Fi. Restarting...");
      ESP.restart();  // Restart ESP32 if Wi-Fi connection fails
    }
  }

  Serial.println();
  Serial.print("Connected to Wi-Fi with IP: ");
  Serial.println(WiFi.localIP());
  Serial.println();
}
void firebaseInit() {
  Serial.println("Firebase Connection Starts...");

  /* Assign the api key (required) */
  config.api_key = API_KEY;

  /* Assign the RTDB URL (required) */
  config.database_url = DATABASE_URL;

  /* Sign up */
  if (Firebase.signUp(&config, &auth,"test12345@gmail.com", "1234567")) {
    Serial.println("ok");
    signupOK = true;
  } else {
    Serial.printf("%s\n", config.signer.signupError.message.c_str());
  }

  /* Assign the callback function for the long running token generation task */
  config.token_status_callback = tokenStatusCallback;  //see addons/TokenHelper.h

  Firebase.begin(&config, &auth);
  // Firebase.reconnectWiFi(true);
}
void MFRC522Init() {
  SPI.begin();      // Init SPI bus
  rfid.PCD_Init();  // Init MFRC522
  for (byte i = 0; i < 6; i++) {
    key.keyByte[i] = 0xFF;
  }

  Serial.println(F("RFID is ready to read the data"));
  Serial.print(F("Using the following key:"));
  printDec(rfid.uid.uidByte, rfid.uid.size);
  Serial.println();
}


std::vector<String> getSlotsFromCloud() {
  std::vector<String> dataArray;
  for (int i = 0; i <= 50; i++) {
    if (Firebase.RTDB.getString(&fbdo, "slots/s" + String(i) + "/isReserved")) {
      if (fbdo.stringData() == "RESERVED") {
        if (Firebase.RTDB.getString(&fbdo, "slots/s" + String(i) + "/userID")) {
          dataArray.push_back(fbdo.stringData());
        }
      } else {
        dataArray.push_back("");
      }
    } else {
      Serial.println("Failed to retrieve data: " + fbdo.errorReason());
    }
    vTaskDelay(10 / portTICK_PERIOD_MS);  // Short delay to prevent watchdog timeout
  }
  return dataArray;
}


void printDec(byte *buffer, byte bufferSize) {
  for (byte i = 0; i < bufferSize; i++) {
    Serial.print(' ');
    Serial.print(buffer[i]);
    currentCard += String(buffer[i]);  // Convert byte to String and append to currentCard
  }
}
void updateRT(int i) {

  // Attempt to retrieve the "isReserved" status
  Serial.println("Attempting to get reservation status data for slot " + String(i));
  
  
    String status = data[i];
    Serial.println("Current status: " + status);

    String update = "";
    if (status == "RESERVED") {
      update = "OCCUPIED";
    } else if (status == "OCCUPIED") {
      update = "UNRESERVED";
    }

    // Update the reservation status
    if (Firebase.RTDB.setString(&fbdo, "slots/s" + String(i) + "/isReserved", update)) {
      Serial.println("Status updated successfully to " + update);
      
      // Set the timestamp
      String timeStamp = String(millis());
      if (Firebase.RTDB.setString(&fbdo, "slots/s" + String(i) + "/timeStamp", timeStamp)) {
        Serial.println("Timestamp updated successfully: " + timeStamp);
      } else {
        Serial.println("Failed to set timestamp data");
        Serial.println("Reason: " + fbdo.errorReason());
      }
    } else {
      Serial.println("Failed to set reserved status data");
      Serial.println("Reason: " + fbdo.errorReason());
    }
}


bool checkCards() {
  currentSlot = 1000;
  for (int i = 0; i < data.size(); i++) {

    String trimmedCard = currentCard;
    String trimmedData = data[i];

    trimmedCard.trim();
    trimmedData.trim();
    Serial.println("Comparing with: " + trimmedData + " == " + trimmedCard);
    if (trimmedCard == trimmedData) {
      currentSlot += i;
      // updateRT(i);
      return true;
    }
  }
  return false;
}

void dataRetrievalTask(void *parameter) {
  for (;;) {
    if (Firebase.ready() && signupOK) {
      data = getSlotsFromCloud();
      Serial.println("Data retrieved successfully.");
    }
    vTaskDelay(500 / portTICK_PERIOD_MS);  // 500 ms delay to allow the watchdog to reset
  }
}


void cardDetectionTask(void *parameter) {
  for (;;) {
    if (!data.empty() && rfid.PICC_IsNewCardPresent() && rfid.PICC_ReadCardSerial()) {
      currentCard = "";
      for (byte i = 0; i < rfid.uid.size; i++) {
        currentCard += String(rfid.uid.uidByte[i]);
      }
      if (checkCards()) {
        sevseg.setNumber(currentSlot);
        displayNeedsUpdate = true;
        for (int pos = 0; pos <= 90; pos++) {
          myservo.write(pos);
          sevseg.refreshDisplay();
          delay(5);  // This delay can be problematic
          vTaskDelay(1 / portTICK_PERIOD_MS); // Yield here
        }
        delay(5000); // This delay may need to be shortened
        for (int pos = 90; pos >= 0; pos--) {
          myservo.write(pos);
          sevseg.refreshDisplay();
          delay(5);  // This delay can also be problematic
          vTaskDelay(1 / portTICK_PERIOD_MS); // Yield here
        }
      } else {
        displayNeedsUpdate = false;
      }
      rfid.PICC_HaltA();
      rfid.PCD_StopCrypto1();
    }
    vTaskDelay(100 / portTICK_PERIOD_MS);  // Use vTaskDelay for non-blocking delay
  }
}


void setup() {
  Serial.begin(115200);
  wifiInit();
  firebaseInit();
  MFRC522Init();
  SevSegInit();
  servoInit();

  // Start tasks
  xTaskCreatePinnedToCore(dataRetrievalTask, "Data Retrieval", 15000, NULL, 1, &dataRetrievalTaskHandle, 0);
  xTaskCreatePinnedToCore(cardDetectionTask, "Card Detection", 15000, NULL, 1, &cardDetectionTaskHandle, 1);
}

void loop() {
  if (displayNeedsUpdate) {
    sevseg.refreshDisplay();
    delay(5);
  }
}