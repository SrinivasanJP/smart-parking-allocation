#include <SPI.h>
#include <MFRC522.h>

#define RST_PIN 22
#define SS_PIN 21

MFRC522 mfrc522(SS_PIN, RST_PIN);  // Create MFRC522 instance

void setup() {
  Serial.begin(115200); // Use a higher baud rate for ESP32
  while (!Serial); // Wait for serial port to open
  SPI.begin(); // Initialize SPI bus
  mfrc522.PCD_Init(); // Initialize MFRC522
  delay(4); // Optional delay
  mfrc522.PCD_DumpVersionToSerial(); // Dump MFRC522 version info
  Serial.println(F("Scan PICC to see UID, SAK, type, and data blocks..."));
}

void loop() {
  // Check if a new card is present
  if (!mfrc522.PICC_IsNewCardPresent()) {
    return;
  }

  // Select the card
  if (!mfrc522.PICC_ReadCardSerial()) {
    return;
  }

  // Print card info to serial
  Serial.println(F("Card detected."));
  Serial.print(F("UID:"));
  for (byte i = 0; i < mfrc522.uid.size; i++) {
    Serial.print(F(" 0x"));
    Serial.print(mfrc522.uid.uidByte[i], HEX);
  }
  Serial.println();

  // Print additional information
  Serial.print(F("SAK: 0x"));
  Serial.println(mfrc522.PICC_GetType(mfrc522.uid.sak), HEX);
  Serial.println(F("Dumping card data to serial..."));
  
  mfrc522.PICC_DumpToSerial(&(mfrc522.uid));

  // Halt PICC
  mfrc522.PICC_HaltA();
  // Stop encryption on PCD
  mfrc522.PCD_StopCrypto1();
}
