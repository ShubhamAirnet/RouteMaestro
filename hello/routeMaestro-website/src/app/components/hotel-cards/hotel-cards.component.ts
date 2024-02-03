import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import axios from 'axios';
import { ChangeDetectorRef } from '@angular/core';
import { HotelsService } from 'src/app/Services/hotels_api/hotels.service';
@Component({
  selector: 'app-hotel-cards',
  templateUrl: './hotel-cards.component.html',
  styleUrls: ['./hotel-cards.component.scss']
})
export class HotelCardsComponent implements OnInit {
 

  resultCount:number=10;
  @Input() dialog: boolean;
  @Input() allHotels: any; 
  @Input() city:any;
  @Output() closeDialog: EventEmitter<void> = new EventEmitter<void>();
  @Output() addToItineraryEvent = new EventEmitter<any>();
  // hotels:any;
  selectedHotel: any = null;


  constructor(private auth:HotelsService,private cdr: ChangeDetectorRef) {
    // this.getData()
    
    

   }
   ngOnChanges(changes: SimpleChanges): void {
    console.log("HotelCardsComponent ngOnChanges", changes);
    console.log(this.allHotels)
    console.log(this.city.cityName)
    // You can add logic here to handle input changes if needed
  }


  ngOnInit(): void {      }
  getStarArray(rating: number): any[] {
    return Array(rating).fill(0);
  }


  async getData(){
    console.log('fetching')
    try{
      const res=await this.auth.getAllDetails(this.resultCount);
      console.log(res.data);
      this.allHotels=res.data.data
    }catch(error){
      console.log(error)
    }
  }


  loadMoreData(){
    this.resultCount+=10;
    this.getData();
  }

  close(){
    this.closeDialog.emit();
  }

  isSelectedHotel(hotel: any): boolean {
    return this.selectedHotel === hotel;
  }

  // Function to handle hotel selection
  selectHotel(hotel: any): void {
    if (this.isSelectedHotel(hotel)) {
      // If already selected, deselect
      this.selectedHotel = null;
    } else {
      // If not selected, select
      this.selectedHotel = hotel;
    }
  }

  // Function to handle 'Add to Itinerary' button click
  addToItinerary(): void {
    if (this.selectedHotel) {
      // Log or perform any action with the selected hotel data
      console.log('Selected Hotel Data:', this.selectedHotel);
      this.addToItineraryEvent.emit(this.selectedHotel);
      this.close()
    } else {
      // Handle case when no hotel is selected
      console.log('No hotel selected.');
    }
  }

}
