import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-city-schedule',
  templateUrl: './city-schedule.component.html',
  styleUrls: ['./city-schedule.component.scss']
})
export class CityScheduleComponent implements OnInit {
  @Input() cityName;
  @Input() dialog: boolean;
  @Output() closeDialog: EventEmitter<void> = new EventEmitter<void>();

  constructor() { }

  ngOnInit(): void {
  }

  isHotelInfo=false;

  showHotelInfo(){
    this.isHotelInfo=!this.isHotelInfo;
  }
  dialogbox() {
    this.closeDialog.emit();
  }
}
