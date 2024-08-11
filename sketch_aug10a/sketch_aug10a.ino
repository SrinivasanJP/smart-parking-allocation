#include "SevSeg.h"
SevSeg sevseg; //Initiate a seven segment controller object


void setup() {
    byte numDigits = 4;  
    byte digitPins[] = {23, 22, 21, 19};
    byte segmentPins[] = {27,32,14,33,25,13,12,26};
    bool resistorsOnSegments = 0; 
    // variable above indicates that 4 resistors were placed on the digit pins.
    // set variable to 1 if you want to use 8 resistors on the segment pins.
    sevseg.begin(COMMON_CATHODE, numDigits, digitPins, segmentPins, resistorsOnSegments);
    sevseg.setBrightness(90);
}
void loop() {
  
    sevseg.setNumber(1043);
    sevseg.refreshDisplay();
}
