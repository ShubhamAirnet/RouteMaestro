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

  // filters variable
  isRefundable:boolean=false;
  isNonRefundable:boolean=true;
  isLCC:boolean=false;
  isNonLCC:boolean=true;
  isFiltered:boolean=false;
  filteredFlights:any;
  numberOfStopsFilter: number=1;
  airline:string="Swiss";
  airlineNames: Set<string> = new Set();

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

  ngOnInit(): void {
   
  }

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
        this.applyFilters()
      

        this.currentFlightSetIndex = "OB1";
        this.gotAllFlights = true;
      }
    } catch (err) {
      console.log(err);
    }
  }


  // filters

  
// isRefundable
filterFlights() {
  if (this.isFiltered) {
    this.filteredFlights = this.allFlights.filter((item) => {
      const refundableCondition = (this.isRefundable && item.isRefundable === true) || (this.isNonRefundable && item.isRefundable === false);
      const lccCondition = (this.isLCC && item.isLCC === true) || (this.isNonLCC && item.isLCC === false);
      const airlineCondition = this.airline === '' || item.segments.some((sector) => sector.some((key) => key.Airline.AirlineName === this.airline));
      const stopsCondition = this.numberOfStopsFilter === null || item.segments.some((sector) => sector.length - 1 === this.numberOfStopsFilter);

      console.log('refundableCondition: ', refundableCondition);
      console.log('lccCondition: ', lccCondition);
      console.log('airlineCondition: ', airlineCondition);
      console.log('stopsCondition: ', stopsCondition);


      return refundableCondition && lccCondition && airlineCondition && stopsCondition;
    });
  } else {
    // Handle the case when none of the filters are active
    this.filteredFlights = this.allFlights;
  }
  console.log('filtered ', this.filteredFlights);
  this.getAirlineNames(this.filteredFlights);
}


// Call this function whenever any of the filter conditions change
applyFilters() {
  this.isFiltered=true;
  this.filterFlights();
}

//  to get all unique airline Names

getAirlineNames( flights:any){
  flights.map((item)=>{
    item.segments.map((sectors)=>{
      sectors.map((key)=>{
        this.airlineNames.add(key.Airline.AirlineName)
      })
    })
  })
  console.log('names',this.airlineNames)
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
