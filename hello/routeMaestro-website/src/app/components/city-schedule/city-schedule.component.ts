import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-city-schedule',
  templateUrl: './city-schedule.component.html',
  styleUrls: ['./city-schedule.component.scss']
})
export class CityScheduleComponent implements OnInit {
  @Input() city:any;
  @Input() checkInDate:any;
  @Input() allHotels:any;
  dialog: boolean=false;
  hotelName:string;
 selectedHotel:any=null;
 cheapestHotel:any=null;
 @Output() hotelNameChange: EventEmitter<string> = new EventEmitter<string>();

  // incoming currentLFightSet
  @Input() currentFlightSet;

  // schedule variables
  @Input()allSchedules;

  daysScheduleInCity=[]

  constructor() { }

  ngOnInit(): void {

    console.log(this.allSchedules)
    console.log(this.currentFlightSet)

    console.log(this.city);
    console.log(this.allHotels);
    this.findHotelWithLowestPrice(this.allHotels);
    this.hotelName = this.selectedHotel ? this.selectedHotel : this.cheapestHotel;
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log("HotelCardsComponent ngOnChanges", changes);
   
    // You can add logic here to handle input changes if needed
  }

  handleAddToItinerary(selectedHotel: any): void {
    // Perform any action with the selected hotel data in the parent component
    console.log('Received Hotel Data in Parent Component:', selectedHotel);
    this.selectedHotel = selectedHotel;
    this.hotelName = this.selectedHotel ? this.selectedHotel : this.cheapestHotel;
    this.hotelNameChange.emit(this.hotelName);

  }

  isHotelInfo=false;

  showHotelInfo(){
    this.isHotelInfo=!this.isHotelInfo;
  }
  dialogbox() {
    this.dialog=!this.dialog;
  }

  findHotelWithLowestPrice(allHotels: any): string {
    let lowestPriceHotelName: string = "";
  
    if (allHotels && allHotels.length > 0) {
      // Initialize with the first hotel's price
      let lowestPrice: number = allHotels[0]?.Response[0]?.search?.Price?.PublishedPrice;
  
      // Iterate through all hotels
      for (const hotel of allHotels) {
        if(hotel.cityName==this.city.cityName){
          for (const response of hotel?.Response) {
            const currentPrice = response?.search?.Price?.PublishedPrice;
            
            // Check if current hotel's price is lower than the lowest price
            if (currentPrice !== undefined && currentPrice < lowestPrice) {
              lowestPrice = currentPrice;
              lowestPriceHotelName = response?.search?.HotelName || "";
            }
          }
        }
      }
    }
    console.log(lowestPriceHotelName)
    this.cheapestHotel=lowestPriceHotelName;
    return lowestPriceHotelName;
  }



  // schedule frontend functions

  getNumberOfDaysInCity(citySchedule){
    const days=citySchedule.days.length
    // console.log(days)
    this.getDaysScheduleForCity(citySchedule);
    return days
  }

  getCityName(citySchedule){
    // console.log("hello");
    return citySchedule.cityName;
  }

  getDaysScheduleForCity(citySchedule){

    this.daysScheduleInCity=citySchedule.days

    // console.log(this.daysScheduleInCity)
  }


  getMorningActivity(oneDaySchedule){
    let activity=null;
    oneDaySchedule.activities.filter(timePeriod=>{
      // console.log(timePeriod)
      if(timePeriod.activity_timeperiod==="morning" ){
        // console.log(timePeriod.activity_name)
        activity= timePeriod.activity_name
      } 
      
    })
    // console.log(activity)
    if(activity===null)return "Leisure Time"
    return activity
    
  }

  getAfternoonActivity(oneDaySchedule){
    let activity=null;

    oneDaySchedule.activities.filter(timePeriod=>{
      if(timePeriod.activity_timeperiod==="afternoon" ) activity= timePeriod.activity_name
      
    })
    console.log(activity)
    if(activity===null)return "Leisure Time"
    return activity
  }

  getEveningActivity(oneDaySchedule){
    let activity=null;

    oneDaySchedule.activities.filter(timePeriod=>{
      if(timePeriod.activity_timeperiod==="evening" ) activity= timePeriod.activity_name
      
    })

    if(activity===null)return "Leisure Time"
    return activity
  }


  getNightActivity(oneDaySchedule){
    let activity=null;

    oneDaySchedule.activities.filter(timePeriod=>{
      if(timePeriod.activity_timeperiod==="night" ) activity= timePeriod.activity_name
      
    })

    if(activity===null)return "Leisure Time"
    return activity
  }


}
