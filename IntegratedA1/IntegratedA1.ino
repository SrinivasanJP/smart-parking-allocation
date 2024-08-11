
#include <Arduino.h>
#include <WiFi.h>
#include <Firebase_ESP_Client.h>
//Provide the token generation process info.
#include "addons/TokenHelper.h"
//Provide the RTDB payload printing info and other helper functions.
#include "addons/RTDBHelper.h"


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
unsigned long sendDataPrevMillis = 0;
int count = 0;
bool signupOK = false;

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

}

void loop() {
  if (Firebase.ready() && signupOK && (millis() - sendDataPrevMillis > 15000 || sendDataPrevMillis == 0)) {
        sendDataPrevMillis = millis();
        
        std::vector<String> data = getSlotsFromCloud();
        
        // You can now use 'data' as needed
        for (size_t i = 0; i < data.size(); i++) {
            Serial.println("Data at index " + String(i) + ": " + data[i]);
        }
    }
}
