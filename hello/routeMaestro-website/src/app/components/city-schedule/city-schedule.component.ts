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

  // incoming currentLFightSet
  @Input() currentFlightSet;

  // schedule variables
  @Input()allSchedules;

  daysScheduleInCity=[]

  constructor() { }

  ngOnInit(): void {
    console.log(this.allSchedules)
    console.log(this.currentFlightSet)
  }

  isHotelInfo=false;

  showHotelInfo(){
    this.isHotelInfo=!this.isHotelInfo;
  }
  dialogbox() {
    this.closeDialog.emit();
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
