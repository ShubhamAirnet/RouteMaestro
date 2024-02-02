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
  // hotels:any;

 

  constructor(private auth:HotelsService,private cdr: ChangeDetectorRef) {
    // this.getData()
    
    
   }
   ngOnChanges(changes: SimpleChanges): void {
    console.log("HotelCardsComponent ngOnChanges", changes);
    console.log(this.allHotels)
    console.log(this.city)
    // You can add logic here to handle input changes if needed
  }

  //  async getAllDetails() {
  //   try {
  //     const res = await axios.post('http://localhost:4000/hotel/getIternary', { resultCount: this.resultCount });
  //     console.log(res.data);
  //     this.hotels = res.data.data;
  
  //     // Trigger change detection manually
  //     this.cdr.detectChanges();
  //   } catch (error) {
  //     console.log(error);
  //   }
  // }
  ngOnInit(): void {
    // this.getData()
    
  }
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
}
