import { Component, Input, OnInit, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-alternate-hotel-cards',
  templateUrl: './alternate-hotel-cards.component.html',
  styleUrls: ['./alternate-hotel-cards.component.scss']
})
export class AlternateHotelCardsComponent implements OnInit {
  @Input() hotels:any;
  constructor() { 
    
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log("HotelCardsComponent ngOnChanges", changes);
    console.log(this.hotels)

    // You can add logic here to handle input changes if needed
  }
  ngOnInit(): void {
    console.log('fetching')
    console.log(this.hotels)
  }

}
