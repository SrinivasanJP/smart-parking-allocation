
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
#define WIFI_SSID "TATA WIFI_2.4GHz"
#define WIFI_PASSWORD "ssss@2003"
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
SevSeg sevseg; //Initiate a seven segment controller object
Servo myservo;  // create servo object to control a servo



 
int swevo_pos = 0;
unsigned long sendDataPrevMillis = 0;
bool signupOK = false;
std::vector<String> data;
int currentSlot = 1000;
bool displayNeedsUpdate = false;
unsigned long lastRefreshTime = 0;
void servoInit(){
  myservo.setPeriodHertz(50);    // standard 50 hz servo
	myservo.attach(SERVO_PIN, 500, 2400);
}
void SevSegInit(){
  byte numDigits = 4;  
    byte digitPins[] = {5, 15, 2, 4};
    byte segmentPins[] = {27,32,14,33,25,13,12};
    bool resistorsOnSegments = 0; 
    // variable above indicates that 4 resistors were placed on the digit pins.
    // set variable to 1 if you want to use 8 resistors on the segment pins.
    sevseg.begin(COMMON_CATHODE, numDigits, digitPins, segmentPins, resistorsOnSegments);
    sevseg.setBrightness(90);
}
void wifiInit(){
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("Connecting to Wi-Fi: ");
  Serial.println(WIFI_SSID);

  // Wait for connection
  int retryCount = 0;
  while (WiFi.status() != WL_CONNECTED) {
    Serial.print(".");
    delay(500);
    retryCount++;
    if (retryCount >= 20) { // Adjust retry count if needed
      Serial.println();
      Serial.println("Failed to connect to Wi-Fi. Restarting...");
      ESP.restart(); // Restart ESP32 if Wi-Fi connection fails
    }
  }
  
  Serial.println();
  Serial.print("Connected to Wi-Fi with IP: ");
  Serial.println(WiFi.localIP());
  Serial.println();
}
void firebaseInit(){
  Serial.println("Firebase Connection Starts...");

  /* Assign the api key (required) */
  config.api_key = API_KEY;

  /* Assign the RTDB URL (required) */
  config.database_url = DATABASE_URL;

  /* Sign up */
  if (Firebase.signUp(&config, &auth, "test@gmail.com", "1234567")){
    Serial.println("ok");
    signupOK = true;
  }
  else{
    Serial.printf("%s\n", config.signer.signupError.message.c_str());
  }

  /* Assign the callback function for the long running token generation task */
  config.token_status_callback = tokenStatusCallback; //see addons/TokenHelper.h
  
  Firebase.begin(&config, &auth);
  Firebase.reconnectWiFi(true);
}
void MFRC522Init(){
  SPI.begin(); // Init SPI bus
  rfid.PCD_Init(); // Init MFRC522 
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
    FirebaseJsonArray jsonArray;
    FirebaseJsonData jsonData;

    if (Firebase.RTDB.getArray(&fbdo, "slots/array", &jsonArray)) {
        Serial.println("Data retrieved successfully:");

        for (size_t i = 0; i < jsonArray.size(); i++) {
            jsonArray.get(jsonData, i);
            if (jsonData.typeNum == FirebaseJson::JSON_STRING) {
                String value = jsonData.stringValue;
                dataArray.push_back(value);
                Serial.println("Value at index " + String(i) + ": " + value);
            }
        }
    } else {
        Serial.println("Failed to retrieve data");
        Serial.println("Reason: " + fbdo.errorReason());
    }

    return dataArray;

}


void setup() {
  Serial.begin(115200);
  wifiInit();
  firebaseInit();
  MFRC522Init();
  SevSegInit();
  servoInit();

}
void printDec(byte *buffer, byte bufferSize) {
  for (byte i = 0; i < bufferSize; i++) {
    Serial.print(' ');
    Serial.print(buffer[i]);
    currentCard += String(buffer[i]);  // Convert byte to String and append to currentCard
  }
}
bool checkCards(){
  currentSlot = 1000;
  for(int i=0; i<data.size();i++){
          
          String trimmedCard = currentCard;
          String trimmedData = data[i];

          trimmedCard.trim();
          trimmedData.trim();
          Serial.println("Comparing with: " + trimmedData +" == "+trimmedCard);
          if(trimmedCard == trimmedData){
              currentSlot += i;
              return true;

          } 
        }
    return false;
}

void loop() {
  
  // Retrieve data from Firebase if ready and required
    if (Firebase.ready() && signupOK && (millis() - sendDataPrevMillis > 15000 || sendDataPrevMillis == 0)) {
        sendDataPrevMillis = millis();
        data = getSlotsFromCloud();
    }

    if (!data.empty()) {
        if (rfid.PICC_IsNewCardPresent()) {
            if (rfid.PICC_ReadCardSerial()) {
                Serial.print(F("PICC type: "));
                MFRC522::PICC_Type piccType = rfid.PICC_GetType(rfid.uid.sak);
                Serial.println(rfid.PICC_GetTypeName(piccType));

                if (piccType != MFRC522::PICC_TYPE_MIFARE_MINI &&  
                    piccType != MFRC522::PICC_TYPE_MIFARE_1K &&
                    piccType != MFRC522::PICC_TYPE_MIFARE_4K) {
                    Serial.println(F("Your tag is not of type MIFARE Classic."));
                    return;
                }

                if (rfid.uid.uidByte[0] != nuidPICC[0] || 
                    rfid.uid.uidByte[1] != nuidPICC[1] || 
                    rfid.uid.uidByte[2] != nuidPICC[2] || 
                    rfid.uid.uidByte[3] != nuidPICC[3] ) {
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
                        displayNeedsUpdate = true; // Set flag to keep the display updated
                        for (swevo_pos = 0; swevo_pos <= 90; swevo_pos += 1) { // goes from 0 degrees to 180 degrees
                          // in steps of 1 degree
                          sevseg.refreshDisplay();
                          myservo.write(swevo_pos);    // tell servo to go to position in variable 'pos'
                          delay(5);             // waits 15ms for the servo to reach the position
                        }
                        for(int i=0;i<5000;i++){
                          sevseg.refreshDisplay();
                          delay(1);
                        }
                        for(swevo_pos = 90;swevo_pos>=0;swevo_pos-=1){
                          sevseg.refreshDisplay();
                          myservo.write(swevo_pos);
                          delay(5);
                        }
                    }else{
                      displayNeedsUpdate =false;
                    }
                }
                else {
                    Serial.println(F("Card read previously."));
                }

                rfid.PICC_HaltA();
                rfid.PCD_StopCrypto1();
            }
        }

        // Continuously refresh the display with the currentSlot value
         if (displayNeedsUpdate) {  // Refresh every 5ms
         for(int i=0;i<500;i++){
            sevseg.refreshDisplay();
          delay(1);
        }
        }
    }
}
