#include <Arduino.h>
#include <WiFi.h>
#include <Firebase_ESP_Client.h>
#include "addons/TokenHelper.h"
#include "addons/RTDBHelper.h"
#include <SPI.h>
#include <MFRC522.h>
#include "SevSeg.h"
#include <ESP32Servo.h>

// RFID pins
#define SS_PIN 21
#define RST_PIN 22

#define SERVO_PIN 26

// Constants TODO: Split env constants to the separate file
#define WIFI_SSID "TATA WIFI_2.4GHz"
#define WIFI_PASSWORD "ssss@2003"
#define API_KEY "AIzaSyAJV8hpZ-hNij0PCy6mh_6VbGBngwZqqoU"
#define DATABASE_URL "https://smart-parking-allocation-default-rtdb.asia-southeast1.firebasedatabase.app/"

// Firebase Data object
FirebaseData fbdo;
FirebaseAuth auth;
FirebaseConfig config;

MFRC522 rfid(SS_PIN, RST_PIN);
MFRC522::MIFARE_Key key;
byte nuidPICC[4];
String currentCard;
SevSeg sevseg;  // Initiate a seven-segment controller object
Servo myservo;  // Create servo object to control a servo

// Slot structure
struct slot {
  int id;
  int UID_User;
  bool isReserved;
} typedef s;

int swevo_pos = 0;
unsigned long sendDataPrevMillis = 0;
bool signupOK = false;
// Map<String, String> data; // Use Arduino's Map to store data
int currentSlot = 1000;
bool displayNeedsUpdate = false;
unsigned long lastRefreshTime = 0;


String slotUserID[10];
String slotStatus[10];
void servoInit() {
  myservo.setPeriodHertz(50);  // standard 50 hz servo
  myservo.attach(SERVO_PIN, 500, 2400);
}
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


void wifiInit() {
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("Connecting to Wi-Fi: ");
  Serial.println(WIFI_SSID);
  int retryCount = 0;
  while (WiFi.status() != WL_CONNECTED) {
    Serial.print(".");
    delay(500);
    retryCount++;
    if (retryCount >= 20) {
      Serial.println();
      Serial.println("Failed to connect to Wi-Fi. Restarting...");
      ESP.restart();
    }
  }
  Serial.println();
  Serial.print("Connected to Wi-Fi with IP: ");
  Serial.println(WiFi.localIP());
  Serial.println();
}

void firebaseInit() {
  Serial.println("Firebase Connection Starts...");
  config.api_key = API_KEY;
  config.database_url = DATABASE_URL;

  if (Firebase.signUp(&config, &auth, "test12345@gmail.com", "1234567")) {
    Serial.println("ok");
    signupOK = true;
  } else {
    Serial.printf("%s\n", config.signer.signupError.message.c_str());
  }

  config.token_status_callback = tokenStatusCallback;
  Firebase.begin(&config, &auth);
  Firebase.reconnectWiFi(true);
}

void updateRT(int i) {
  String status = slotStatus[i];
  Serial.println("Current status: " + String(status.c_str()));
  if (status == "RESERVED") {
    Firebase.RTDB.setString(&fbdo, "slots/s" + String(i + 1) + "/isReserved", "OCCUPIED");
    Firebase.RTDB.setString(&fbdo, "slots/s" + String(i + 1) + "/timestamp", String(millis()));
    
  } else if (status == "OCCUPIED") {
    Firebase.RTDB.setString(&fbdo, "slots/s" + String(i + 1) + "/isReserved", "UNRESERVED");
     Firebase.RTDB.setString(&fbdo, "slots/s" + String(i + 1) + "/timestamp", String(millis()));
  }
}

void getSlotsFromCloud() {
  Serial.println("Data retrieval initiated...");

  for (int i = 0; i < 10; i++) {
    if (Firebase.RTDB.getString(&fbdo, "slots/s" + String(i + 1) + "/isReserved")) {
      String status = fbdo.stringData();
      String userID = "";

      if (status == "RESERVED" || status == "OCCUPIED") {
        if (Firebase.RTDB.getString(&fbdo, "slots/s" + String(i + 1) + "/userID")) {
          userID = fbdo.stringData();
        }
      } else {
        userID = "";
      }
      slotUserID[i] = userID;
      slotStatus[i] = status;
      Serial.println("Slot " + String(i) + " status: " + status + ", userID: " + userID);
    } else {
      Serial.println("Failed to retrieve status for slot " + String(i));
    }
  }

  Serial.println("Data retrieved.");
}

// bool checkCards() {
//   currentSlot = 1000;

//   if (Firebase.ready() && signupOK && (millis() - sendDataPrevMillis > 15000 || sendDataPrevMillis == 0)) {
//     sendDataPrevMillis = millis();
//     data = getSlotsFromCloud();
//   }

//   for (auto& slot : data) {
//     String slotID = slot.first;
//     String status = slot.second;

//     Serial.println("Comparing current card with slot " + slotID + " having status: " + status);

//     if (currentCard == slotID) {
//       currentSlot = slotID.toInt();
//       updateRT(currentSlot);
//       return true;
//     }
//   }

//   return false;
// }

void setup() {
  Serial.begin(115200);
  randomSeed(analogRead(0));
  wifiInit();
  firebaseInit();
  MFRC522Init();
  SevSegInit();
  servoInit();
  if (Firebase.ready() && signupOK && (millis() - sendDataPrevMillis > 15000 || sendDataPrevMillis == 0)) {
    sendDataPrevMillis = millis();
    getSlotsFromCloud();
  }
}
void printDec(byte *buffer, byte bufferSize) {
  for (byte i = 0; i < bufferSize; i++) {
    Serial.print(' ');
    Serial.print(buffer[i]);
    currentCard += String(buffer[i]);  // Convert byte to String and append to currentCard
  }
}
bool checkCards() {
  currentSlot = 1000;
  if (Firebase.ready() && signupOK && (millis() - sendDataPrevMillis > 15000 || sendDataPrevMillis == 0)) {
    sendDataPrevMillis = millis();
    getSlotsFromCloud();
  }

  for (int i = 0; i < 10; i++) {

    String trimmedCard = currentCard;
    String trimmedData = slotUserID[i];

    trimmedCard.trim();
    trimmedData.trim();
    Serial.println("Comparing with: " + trimmedData + " == " + trimmedCard);
    if (trimmedCard == trimmedData) {
      currentSlot += i;
      updateRT(i);
      Serial.println(i);
      return true;
    }
  }
  return false;
}
void loop() {
 
    if (rfid.PICC_IsNewCardPresent()) {
      if (rfid.PICC_ReadCardSerial()) {
        Serial.print(F("PICC type: "));
        MFRC522::PICC_Type piccType = rfid.PICC_GetType(rfid.uid.sak);
        Serial.println(rfid.PICC_GetTypeName(piccType));

        if (piccType != MFRC522::PICC_TYPE_MIFARE_MINI && piccType != MFRC522::PICC_TYPE_MIFARE_1K && piccType != MFRC522::PICC_TYPE_MIFARE_4K) {
          Serial.println(F("Your tag is not of type MIFARE Classic."));
          return;
        }
        if (rfid.uid.uidByte[0] != nuidPICC[0] || rfid.uid.uidByte[1] != nuidPICC[1] || rfid.uid.uidByte[2] != nuidPICC[2] || rfid.uid.uidByte[3] != nuidPICC[3]) {
          Serial.println(F("A new card has been detected."));
          for (byte i = 0; i < 4; i++) {
            nuidPICC[i] = rfid.uid.uidByte[i];
          }
          currentCard = "";
          Serial.println(F("The NUID tag is:"));
          Serial.print(F("In dec: "));
          printDec(rfid.uid.uidByte, rfid.uid.size);
          Serial.println();
          if (checkCards()) {
            sevseg.setNumber(currentSlot);
            displayNeedsUpdate = true;                              // Set flag to keep the display updated
            for (swevo_pos = 0; swevo_pos <= 90; swevo_pos += 1) {  // goes from 0 degrees to 180 degrees
              // in steps of 1 degree
              sevseg.refreshDisplay();
              myservo.write(swevo_pos);  // tell servo to go to position in variable 'pos'
              delay(5);                  // waits 15ms for the servo to reach the position
            }
            for (int i = 0; i < 5000; i++) {
              sevseg.refreshDisplay();
              delay(1);
            }
            for (swevo_pos = 90; swevo_pos >= 0; swevo_pos -= 1) {
              sevseg.refreshDisplay();
              myservo.write(swevo_pos);
              delay(5);
            }
          } else {
            displayNeedsUpdate = false;
          }
        } else {
          Serial.println(F("Card read previously."));
        }
        rfid.PICC_HaltA();
        rfid.PCD_StopCrypto1();
      }
    }
    // Continuously refresh the display with the currentSlot value
    if (displayNeedsUpdate) {  // Refresh every 5ms
      for (int i = 0; i < 500; i++) {
        sevseg.refreshDisplay();
        delay(1);
      }
    }
  }
