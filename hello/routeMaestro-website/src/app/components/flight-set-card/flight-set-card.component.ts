import { Component, OnInit, Input, ViewChild, ElementRef } from "@angular/core";

@Component({
  selector: "app-flight-set-card",
  templateUrl: "./flight-set-card.component.html",
  styleUrls: ["./flight-set-card.component.scss"],
})
export class FlightSetCardComponent implements OnInit {
  @Input() flightSet: any;

  // this for the highlighting purposes
  @Input() currentFlightSetResultIdx: string;

  @ViewChild("myButton", { static: true }) myButton: ElementRef;

  btnvalueResultIdx: string;

  // flightSetOnDisplay;

  // flightSetOnDisplayResultIdx:string;

  flightSetSegmentsArray = [];

  // isSelected = false;

  constructor() {}

  ngOnInit(): void {
    // console.log(this.key +" this is the key from all flights sets key value pair")
    // console.log(this.defaultFlightSetKey +"this is the key for the current deafult flight Set setted in the itinerary");

    // // setting the current flight set result index which is on display.
    // // on component rendering it would be the result Index of the first element of the power Array
    // this.flightSetOnDisplayResultIdx=this.allFlightSetsPowerArray[0].resultIndex;
    // this.getFlightSetToDisplay(this.flightSetOnDisplayResultIdx);
    // console.log(this.allFlightSetsPowerArray +"these are all the flight sets available for the itinerary");

    // // this.flightSetSegmentsArray = this.similarCollectedFlightSetsArray[0].segments;
    // // console.log(this.flightSetSegmentsArray);
    // console.log("=========================================");

    this.settingFlightSetSegmentsArray();
    // this.btnvalueResultIdx = this.flightSet.resultIndex;

    // console.log(this.btnvalueResultIdx);

    // // for by default
    // if (this.flightSet.resultIndex === this.currentFlightSetResultIdx) {
    //   this.isSelected = true;
    // }
  }

  // getBtnValue() {
  //   return this.btnvalueResultIdx;
  // }

  // flightSetBtnClicked(event: any) {
  //   const buttonValue = this.myButton.nativeElement.value;
  //   this.currentFlightSetResultIdx = buttonValue;
  //   // Reset isSelected for all buttons
  //   this.isSelected = false;

  //   console.log("Button Clicked! Value:", buttonValue);
  //   console.log(this.currentFlightSetResultIdx);
  // }
  // changeStyles() {
  //   this.isSelected = true;
  // }

  settingFlightSetSegmentsArray() {
    this.flightSetSegmentsArray = this.flightSet.segments;

    return;
  }

  // ORIGIN BLOCK
  getOriginAirportCode(oneCompleteFlight) {
    if (oneCompleteFlight.length === 1) {
      return oneCompleteFlight[0].Origin.Airport.AirportCode;
    } else {
      return oneCompleteFlight[0].Origin.Airport.AirportCode;
    }
  }
  getDepartureTime(oneCompleteFlight) {
    const dateString = oneCompleteFlight[0].Origin.DepTime;
    const dateObject = new Date(dateString);

    // Get the time components
    const hours = dateObject.getHours().toString().padStart(2, "0");
    const minutes = dateObject.getMinutes().toString().padStart(2, "0");

    // Combine hours and minutes
    const formattedTime = `${hours}:${minutes}`;

    return formattedTime;
  }
  getOriginFlightDate(oneCompleteFlight) {
    if (oneCompleteFlight.length === 1) {
      const dateString = oneCompleteFlight[0].Origin.DepTime;
      const dateObject = new Date(dateString);

      // Formatting options for the date
      const options: Intl.DateTimeFormatOptions = {
        day: "numeric",
        month: "short",
      };

      // Format the date using the options
      const formattedDate = dateObject.toLocaleDateString("en-US", options);

      return formattedDate;
    } else {
      const dateString = oneCompleteFlight[0].Origin.DepTime;
      const dateObject = new Date(dateString);

      // Formatting options for the date
      const options: Intl.DateTimeFormatOptions = {
        day: "numeric",
        month: "short",
      };

      // Format the date using the options
      const formattedDate = dateObject.toLocaleDateString("en-US", options);

      return formattedDate;
    }
  }

  getOriginAirportTerminal(oneCompleteFlight) {
    return oneCompleteFlight[0].Origin.Airport.Terminal;
  }
  getOriginAirportName(oneCompleteFlight) {
    return oneCompleteFlight[0].Origin.Airport.AirportName;
  }

  getOriginAirportCityName(oneCompleteFlight) {
    return oneCompleteFlight[0].Origin.Airport.CityName;
  }

  getFlightDuration(oneCompleteFlight) {
    let totalMinutes: number;

    // if direct flight
    if (oneCompleteFlight.length === 1) {
      totalMinutes = oneCompleteFlight[0].AccumulatedDuration;
    } else {
      // if indirect flights
      totalMinutes =
        oneCompleteFlight[oneCompleteFlight.length - 1].AccumulatedDuration;
    }

    if (totalMinutes > 60) {
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;

      return `${hours}h ${minutes}m`;
    } else {
      return `${totalMinutes}m`;
    }
  }

  getFirstLayoverCity(oneCompleteFlight) {}
  isTerminalExist(oneCompleteFlight) {
    const terminalValue = oneCompleteFlight[0].Origin.Airport.Terminal;
    if (terminalValue === null || terminalValue === "") {
      return false;
    } else {
      return true;
    }
  }

  // DESTINATION BLOCK
  getArrivalTime(oneCompleteFlight) {
    let dateString;

    if (oneCompleteFlight.length === 1) {
      dateString = oneCompleteFlight[0].Destination.ArrTime;
    } else {
      dateString =
        oneCompleteFlight[oneCompleteFlight.length - 1].Destination.ArrTime;
    }

    const dateObject = new Date(dateString);

    // Get the time components
    const hours = dateObject.getHours().toString().padStart(2, "0");
    const minutes = dateObject.getMinutes().toString().padStart(2, "0");

    // Combine hours and minutes
    const formattedTime = `${hours}:${minutes}`;

    return formattedTime;
  }

  getDestinationCityAirportCode(oneCompleteFlight) {
    if (oneCompleteFlight.length === 1) {
      return oneCompleteFlight[0].Destination.Airport.AirportCode;
    } else {
      return oneCompleteFlight[oneCompleteFlight.length - 1].Destination.Airport
        .AirportCode;
    }
  }

  getDestinationFlightDate(oneCompleteFlight) {
    let dateString;

    if (oneCompleteFlight.length === 1) {
      dateString = oneCompleteFlight[0].Destination.ArrTime;
    } else {
      dateString =
        oneCompleteFlight[oneCompleteFlight.length - 1].Destination.ArrTime;
    }
    const dateObject = new Date(dateString);

    // Formatting options for the date
    const options: Intl.DateTimeFormatOptions = {
      day: "numeric",
      month: "short",
    };

    // Format the date using the options
    const formattedDate = dateObject.toLocaleDateString("en-US", options);

    return formattedDate;
  }

  getDestinationAirportTerminal(oneCompleteFlight) {
    if (oneCompleteFlight.length === 1) {
      return oneCompleteFlight[0].Destination.Airport.Terminal;
    } else {
      return oneCompleteFlight[oneCompleteFlight.length - 1].Destination.Airport
        .Terminal;
    }
  }
  getDestinationAirportName(oneCompleteFlight) {
    if (oneCompleteFlight.length === 1) {
      return oneCompleteFlight[0].Destination.Airport.AirportName;
    } else {
      return oneCompleteFlight[oneCompleteFlight.length - 1].Destination.Airport
        .AirportName;
    }
  }

  getDestinationAirportCityName(oneCompleteFlight) {
    if (oneCompleteFlight.length === 1) {
      return oneCompleteFlight[0].Destination.Airport.CityName;
    } else {
      return oneCompleteFlight[oneCompleteFlight.length - 1].Destination.Airport
        .CityName;
    }
  }

  // FARE SECTION

  getPublishedFareDifference() {
    return this.flightSet.fare.PublishedFare;
  }

  getIncentiveEarned() {
    const totalIncentive =
      this.flightSet.fare.PublishedFare - this.flightSet.fare.OfferedFare;

    return totalIncentive;
  }

  // getFlightSetToDisplay(resultIndex:string){

  //   this.flightSetOnDisplay= this.allFlightSetsPowerArray.filter(flightCard=>(flightCard.resultIndex===resultIndex))

  //   console.log(this.flightSetOnDisplay);

  //   this.settingFlightSetSegmentsArray();
  //   return;
  // }

  // settingFlightSetSegmentsArray(){

  //   if(this.flightSetOnDisplay){
  //     this.flightSetSegmentsArray= this.flightSetOnDisplay[0].segments;
  //     console.log(this.flightSetSegmentsArray)
  //   }

  //   return;
  // }

  //   // ORIGIN BLOCK
  //   getOriginAirportCode(oneCompleteFlight) {
  //     if (oneCompleteFlight.length === 1) {
  //       return oneCompleteFlight[0].Origin.Airport.AirportCode;
  //     } else {
  //       return oneCompleteFlight[0].Origin.Airport.AirportCode;
  //     }
  //   }
  //   getDepartureTime(oneCompleteFlight){

  //     const dateString = oneCompleteFlight[0].Origin.DepTime;
  //     const dateObject = new Date(dateString);

  //     // Get the time components
  //     const hours = dateObject.getHours().toString().padStart(2, '0');
  //     const minutes = dateObject.getMinutes().toString().padStart(2, '0');

  //     // Combine hours and minutes
  //     const formattedTime = `${hours}:${minutes}`;

  //     return formattedTime ;

  //   }
  //   getOriginFlightDate(oneCompleteFlight) {

  //     if (oneCompleteFlight.length === 1) {

  //       const dateString = oneCompleteFlight[0].Origin.DepTime;
  //       const dateObject = new Date(dateString);

  //       // Formatting options for the date
  //       const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' };

  //       // Format the date using the options
  //       const formattedDate = dateObject.toLocaleDateString("en-US", options);

  //       return formattedDate ;
  //     } else {
  //       const dateString = oneCompleteFlight[0].Origin.DepTime;
  //       const dateObject = new Date(dateString);

  //       // Formatting options for the date
  //       const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' };

  //       // Format the date using the options
  //       const formattedDate = dateObject.toLocaleDateString("en-US", options);

  //       return formattedDate ;
  //     }
  //   }

  //   getOriginAirportTerminal(oneCompleteFlight){

  //     return oneCompleteFlight[0].Origin.Airport.Terminal;

  //   }
  //   getOriginAirportName(oneCompleteFlight){

  //     return oneCompleteFlight[0].Origin.Airport.AirportName;

  //   }

  //   getOriginAirportCityName(oneCompleteFlight){

  //     return oneCompleteFlight[0].Origin.Airport.CityName;

  //   }

  //   getFlightDuration(oneCompleteFlight){
  //     let totalMinutes: number;

  //     // if direct flight
  //     if (
  //       oneCompleteFlight.length === 1
  //     ) {
  //       totalMinutes =oneCompleteFlight[0].AccumulatedDuration;
  //     } else {
  //       // if indirect flights
  //       totalMinutes =oneCompleteFlight[oneCompleteFlight.length - 1].AccumulatedDuration;
  //     }

  //     if (totalMinutes > 60) {
  //       const hours = Math.floor(totalMinutes / 60);
  //       const minutes = totalMinutes % 60;

  //       return `${hours}h ${minutes}m`;
  //     } else {
  //       return `${totalMinutes}m`;
  //     }
  //   }

  //   getFirstLayoverCity(oneCompleteFlight){

  //   }
  //   isTerminalExist(oneCompleteFlight){

  //     const terminalValue =   oneCompleteFlight[0].Origin.Airport.Terminal;
  //     if(terminalValue===null || terminalValue==="" ){
  //       return false;
  //     }
  //     else{
  //       return true;
  //     }
  //   }

  // // DESTINATION BLOCK
  // getArrivalTime(oneCompleteFlight){

  //   let dateString;

  //   if(oneCompleteFlight.length===1){
  //     dateString = oneCompleteFlight[0].Destination.ArrTime;
  //   }else{
  //     dateString = oneCompleteFlight[oneCompleteFlight.length-1].Destination.ArrTime;
  //   }

  //   const dateObject = new Date(dateString);

  //     // Get the time components
  //     const hours = dateObject.getHours().toString().padStart(2, '0');
  //     const minutes = dateObject.getMinutes().toString().padStart(2, '0');

  //     // Combine hours and minutes
  //     const formattedTime = `${hours}:${minutes}`;

  //     return formattedTime ;

  // }

  // getDestinationCityAirportCode(oneCompleteFlight){

  //   if(oneCompleteFlight.length===1){

  //     return oneCompleteFlight[0].Destination.Airport.AirportCode;
  //   }
  //   else{
  //     return oneCompleteFlight[oneCompleteFlight.length-1].Destination.Airport.AirportCode;
  //   }

  // }

  // getDestinationFlightDate(oneCompleteFlight){

  //   let dateString;

  //   if (oneCompleteFlight.length === 1) {
  //      dateString = oneCompleteFlight[0].Destination.ArrTime;
  //   }
  //   else {
  //      dateString = oneCompleteFlight[oneCompleteFlight.length-1].Destination.ArrTime;
  //   }
  //   const dateObject = new Date(dateString);

  //     // Formatting options for the date
  //     const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' };

  //     // Format the date using the options
  //     const formattedDate = dateObject.toLocaleDateString("en-US", options);

  //     return formattedDate ;
  // }

  // getDestinationAirportTerminal(oneCompleteFlight){
  // if(oneCompleteFlight.length===1){
  //   return oneCompleteFlight[0].Destination.Airport.Terminal;
  // }
  // else{
  //   return oneCompleteFlight[oneCompleteFlight.length-1].Destination.Airport.Terminal;

  // }

  // }
  // getDestinationAirportName(oneCompleteFlight){

  //   if(oneCompleteFlight.length===1){
  //     return oneCompleteFlight[0].Destination.Airport.AirportName;
  //   }
  //   else{
  //     return oneCompleteFlight[oneCompleteFlight.length-1].Destination.Airport.AirportName;

  //   }

  // }

  // getDestinationAirportCityName(oneCompleteFlight){

  //   if(oneCompleteFlight.length===1){
  //     return oneCompleteFlight[0].Destination.Airport.CityName;
  //   }
  //   else{
  //     return oneCompleteFlight[oneCompleteFlight.length-1].Destination.Airport.CityName;

  //   }

  // }

  // // FARE SECTION

  // getPublishedFareDifference(){

  //   return this.flightSetOnDisplay[0].fare.PublishedFare
  // }

  // getIncentiveEarned(){

  //   const totalIncentive=(this.flightSetOnDisplay[0].fare.PublishedFare)-(this.flightSetOnDisplay[0].fare.OfferedFare)

  //   return totalIncentive;

  // }
}
