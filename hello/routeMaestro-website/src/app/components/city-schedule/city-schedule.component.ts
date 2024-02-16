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
 currentHotel=[] as any[];
 @Output() hotelNameChange: EventEmitter<string> = new EventEmitter<string>();

  constructor() { }

  ngOnInit(): void {
    console.log(this.city);
    console.log(this.allHotels);
    this.findHotelWithLowestPrice(this.allHotels);
    console.log(this.currentHotel)
    // this.hotelName = this.selectedHotel ? this.selectedHotel : this.cheapestHotel;
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log("HotelCardsComponent ngOnChanges", changes);
   
    // You can add logic here to handle input changes if needed
  }

  handleAddToItinerary(selectedHotel: any): void {
 
    console.log('Received Hotel Data in Parent Component:', selectedHotel);
    this.selectedHotel = selectedHotel;
    if (this.selectedHotel) {
    
      this.currentHotel.forEach((item) => {
          if (item.checkInDate === this.selectedHotel.checkInDate) {
              item.hotel = this.selectedHotel;
          }
      });
  }
  console.log(this.currentHotel);
  
  }

  isHotelInfo=false;

  showHotelInfo(){
    this.isHotelInfo=!this.isHotelInfo;
  }
  dialogbox() {
    this.dialog=!this.dialog;
  }

  findHotelWithLowestPrice(allHotels: any) {
    let lowestPriceHotelName: string = "";

    this.city?.Properties.map((item) => {
        if (allHotels && allHotels.length > 0) {
            // Initialize lowestPrice here before iterating through hotels
            let lowestPrice = Number.MAX_VALUE; // Start with a high value

            // Iterate through all hotels
            for (const hotel of allHotels) {
                if (hotel?.cityName == this.city?.cityName && item?.date[0] === hotel?.checkInDate) {
                    // Initialize lowestPrice here before iterating through responses
                    for (const response of hotel?.Response) {
                        const currentPrice = response?.search?.Price?.PublishedPrice;

                        if (currentPrice !== undefined && currentPrice < lowestPrice) {
                            lowestPrice = currentPrice;
                            lowestPriceHotelName = response || "";
                        }
                    }
                }
            }

            // Check if a valid lowest price was found before pushing into the array
            if (lowestPrice !== Number.MAX_VALUE) {
                this.currentHotel.push({ checkInDate: item?.date[0], hotel: lowestPriceHotelName });
            }
        }
    });

}


  
}
