import { Component, OnInit, TemplateRef, inject } from "@angular/core";
import { FlightsService } from "src/app/Services/flights_api/flights.service";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { HotelsService } from "src/app/Services/hotels_api/hotels.service";

import { ChangeDetectorRef } from "@angular/core";

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


  // global variables for the hotels
  allHotels: any;
  resultCount: number = 10;
  gotAllHotels:boolean=false

  currentCity: string | undefined;
  cities: any;

  isFlightOptionsAvailable: boolean = false;

  showFlightOptions() {
    this.isFlightOptionsAvailable = !this.isFlightOptionsAvailable;
    // this.settingAlternateFlightOptions();
    return;
  }

  // isHotelInfo=false;
  // toShowHotelInfo(value:string){
  //     this.isHotelInfo=!this.isHotelInfo;
  // }

  constructor(
    private flightApiService: FlightsService,
    private hotels: HotelsService
  ) {}

  ngOnInit(): void {}

  // ngOnChanges(changes: SimpleChanges) {
  //   // Check if the 'currentFlightSetIndex' input property has changed
  //   if (changes.currentFlightSetIndex) {
  //     // Call your function here
  //     this.settingCurrentFlightSetAndSegmentsArr(currentFlightSetIndex);
  //   }
  // }

  // async getCityData(){
  //   try{
  //     const res=await this.hotels.getSearchInfo();

  //     this.cities=res;
  //     console.log(this.cities.cities)
  //     this.cities.cities.map(item=>console.log(item.cityName))
  //   }catch(error){
  //     console.log(error)
  //   }
  // }

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
        this.gotAllFlights = true;
      }
    } catch (err) {
      console.log(err);
    }
  }

  // =====================================================================================================================
  // =====================================================================================================================
  // =====================================================================================================================

  // selectCity(city: string) {
  //   this.currentCity = city;
  // }


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

  // dialogbox(){
  //   this.dialog=!this.dialog;
  // }

  private modalService = inject(NgbModal);

  openXl(content: TemplateRef<any>) {
    this.modalService.open(content, { size: "xl" });
  }

  dismissModal(modal: any) {
    modal.dismiss("Cross click");
  }

  closeModal(modal: any) {
    modal.close("Close click");
  }
}
