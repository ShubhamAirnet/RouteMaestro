import { Component, OnInit } from '@angular/core';
import axios from 'axios'
import { HotelsService } from 'src/app/Services/hotels_api/hotels.service';
@Component({
  selector: 'app-hotel-cards',
  templateUrl: './hotel-cards.component.html',
  styleUrls: ['./hotel-cards.component.scss']
})
export class HotelCardsComponent implements OnInit {
 
  
  dialog:boolean=true;


 

  constructor(private auth:HotelsService) {
   }

  
  ngOnInit(): void {
    // this.getData()
    
  }
  getStarArray(rating: number): any[] {
    return Array(rating).fill(0);
  }

  // loadMoreData(){
  //   this.resultCount+=10;
   
  // }

  close(){
    this.dialog=!this.dialog;
  }
}
