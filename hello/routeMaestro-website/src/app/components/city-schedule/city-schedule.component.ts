import { Component, EventEmitter, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-city-schedule',
  templateUrl: './city-schedule.component.html',
  styleUrls: ['./city-schedule.component.scss']
})
export class CityScheduleComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

  isHotelInfo=false;

  showHotelInfo(){
    this.isHotelInfo=!this.isHotelInfo;
  }
}
