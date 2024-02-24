import { Component, OnInit } from '@angular/core';
import { flightDetails } from './flight_details';
@Component({
  selector: 'app-flight-cancel',
  templateUrl: './flight-cancel.component.html',
  styleUrls: ['./flight-cancel.component.scss']
})
export class FlightCancelComponent implements OnInit {
  flightData=flightDetails;
  fareRule=[]
  constructor() { }

  ngOnInit(): void {
    console.log(this.flightData)
    for(let i=0;i<this.flightData.FareRules.length;i++){
      this.fareRule.push(this.flightData.FareRules[i].FareRuleDetail)
    }
  }

}
