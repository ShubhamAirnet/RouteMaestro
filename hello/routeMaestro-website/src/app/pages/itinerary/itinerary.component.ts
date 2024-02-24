import { Component, OnInit, ViewChild,  } from "@angular/core";
import { FlightsService } from "src/app/Services/flights_api/flights.service";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { HotelsService } from "src/app/Services/hotels_api/hotels.service";

import { ChangeDetectorRef } from "@angular/core";
import { CombinedItineraryComponent } from "src/app/components/combined-itinerary/combined-itinerary.component";

@Component({
  selector: "app-itinerary",
  templateUrl: "./itinerary.component.html",
  styleUrls: ["./itinerary.component.scss"],
})
export class ItineraryComponent implements OnInit {
  
  // global variable for the flights
  allFlights = [];
  currentFlightSetIndex: string;
  gotAllFlights: boolean = false;
  currentFlightSet;

  // global variables for the hotels
  allHotels: any;
  resultCount: number = 10;
  gotAllHotels:boolean=false

  currentCity: string | undefined;
  cities: any;



  constructor(
    private flightApiService: FlightsService,
    private hotels: HotelsService
  ) {}

  ngOnInit(): void {
    console.log(this.allFlights)
  }


  // ----------------------------TRIAL START----------------------------------------------------------------------------
  tooltipStates: boolean[] = [false, false, false];
  tooltipCloseTimeout: any;
  mouseEntered(index: number): void {
    // Set the tooltip state at the specified index to true
    this.tooltipStates = this.tooltipStates.map((state, i) => i === index);

    console.log(this.tooltipStates)
  }
  mouseLeft(index: number): void {
    // Delay closing the tooltip to allow the cursor to move from trigger to tooltip
    this.setTooltipCloseTimeout(index);
  }
  setTooltipCloseTimeout(index: number): void {
    // Close the tooltip after a delay
    this.tooltipCloseTimeout = setTimeout(() => {
      this.tooltipStates[index] = false;
    }, 10000); // Adjust the delay as needed
  }
  mouseOnTooltip(index: number): void {
    clearTimeout(this.tooltipCloseTimeout);
  }
  mouseLeftTooltip(index:number){
    this.setTooltipCloseTimeout(index);
  }
  // ----------------------------TRIAL ENDs----------------------------------------------------------------------------










  // GLOBAL CALLS
  authenticateFlightApi() {
    this.flightApiService.authenticate().subscribe(
      (data: { token: string }) => {
        console.log(data.token);
        localStorage.setItem("authenticateToken", data.token);
      },
      (err) => {
        console.log(err, "error aa gya");
      }
    );
  }

  getFlightsHotels() {
    this.multiStopSearchFlightsV2();
    this.getHotelData();
  }



  // FLIGHT Search Call
  async multiStopSearchFlightsV2() {
    try {
      const data: any = await this.flightApiService.multiStopSearchFlights();

      if (data) {
        this.allFlights = data.flightsData;

        console.log(this.allFlights);

        this.currentFlightSetIndex = "OB1";
        this.currentFlightSet=  this.allFlights.find(flight=>flight.resultIndex===this.currentFlightSetIndex);

        this.gotAllFlights = true;
      }
    } catch (err) {
      console.log(err);
    }
  }

  // HOTEL Search Call
  async getHotelData() {
    try {
      const { fullJourneyHotels } = await this.hotels.getAllDetails(this.resultCount);
      console.log(fullJourneyHotels, "In component");
      this.allHotels=fullJourneyHotels;
      console.log(this.allHotels)
      this.gotAllHotels=true;

    } catch (error) {
      console.log(error);
    }
  }

  // SCHEDULE CALLS
  async getSchedule() {
    console.log("will be getting schedule here");
  }


  allSelectedHotels=[]
  gotAllSelectedHotels(allHotels){
    this.allSelectedHotels=allHotels
    console.log(this.allSelectedHotels)
  }



  // ------------------------------Fare Summary CALLS--------------------------------------------

  getFlightPublishedFare(){
    return this.currentFlightSet.fare.PublishedFare;
  }

  getFlightsIncentive(){
    const incentive=this.currentFlightSet.fare.CommissionEarned+this.currentFlightSet.fare.IncentiveEarned+this.currentFlightSet.fare.AdditionalTxnFeePub +this.currentFlightSet.fare.PLBEarned;
    return incentive
  }

  combinedHotelPublishedFare:number=0;
  getHotelPublishedFare(){
    this.allSelectedHotels.forEach(city=>{
      city.hotels.forEach(property=>{
        console.log(property.hotel.search.Price.PublishedPriceRoundedOff)
        this.combinedHotelPublishedFare+=property.hotel.search.Price.PublishedPriceRoundedOff;
        console.log(this.combinedHotelPublishedFare)
      })
    })
    console.log(this.combinedHotelPublishedFare)
  }






  @ViewChild('combinedItinerary') combinedItinerary: CombinedItineraryComponent;

  finalFlightSetResultIdx:string;

  triggerFlightEmitter(){
     // Call a method in Component B and get data
     const gotCurretnFlightResultIdx = this.combinedItinerary.currentFlightSetIndex;
    
     // Pass data to Component C
     this.finalFlightSetResultIdx = gotCurretnFlightResultIdx;

  }
 
}
