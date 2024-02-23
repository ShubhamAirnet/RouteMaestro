import { Component, EventEmitter, Input, OnInit ,Output,TemplateRef, inject} from '@angular/core';
import { ScheduleService } from 'src/app/Services/schedule_api/schedule.service';
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { StoreService } from 'src/app/Services/store/store.service';
@Component({
  selector: 'app-combined-itinerary',
  templateUrl: './combined-itinerary.component.html',
  styleUrls: ['./combined-itinerary.component.scss']
})
export class CombinedItineraryComponent implements OnInit {
  // flight variables
  @Input() allFlights;
  currentFlightSet;
  currentFlightSetSegmentsArray=[]
  @Input() currentFlightSetIndex:string;
  isCurrentFlightSetLoaded=false;
  offeredFare;
  publishedFare;
  @Output() getCurrentFlightSetIdxEmitter =new EventEmitter<string>();
  // hotel variables
  @Input()allHotels;
  // schedule variables
  allSchedules=[]
  // dialog box
  isFlightOptionsAvailable:boolean=false;
  cities:any;
  // will be calling flights and hotels from the itinerary page itself coz they are global(impacting fare Summary).
  // and will be calling schedules here coz they are already finalized in the first phase.
  constructor(private scheduleService: ScheduleService, private store:StoreService ) {
  }
  ngOnInit(): void {
    this.getAllSchedules()
    console.log(this.allFlights)
    console.log(this.allHotels);
    this.settingCurrentFlightSetAndSegmentsArr(this.currentFlightSetIndex);
  }
  // flights functions
  settingCurrentFlightSetAndSegmentsArr(resultIndex:string){
    this.currentFlightSet=this.allFlights.filter(flightSet=>(flightSet.resultIndex===resultIndex));
    // console.log(this.currentFlightSet)
    this.currentFlightSetSegmentsArray=this.currentFlightSet[0].segments;
    // console.log( this.currentFlightSetSegmentsArray);
    this.isCurrentFlightSetLoaded=true;
    this.offeredFare=this.currentFlightSet[0].fare.OfferedFare;
    this.publishedFare=this.currentFlightSet[0].fare.PublishedFare;
    return
 }
 onHighlightedFlightSetIdxChange(highlightedFlightSetIdx: string) {
   // Handle the highlightedFlightSetIdx value received from the child component
  //  console.log('Received highlightedFlightSetIdx:', highlightedFlightSetIdx);
   this.currentFlightSetIndex=highlightedFlightSetIdx;
   this.settingCurrentFlightSetAndSegmentsArr(this.currentFlightSetIndex)
  //  console.log(this.currentFlightSetIndex)
 }
emitCurrentFlightSetIdx(){
  this.getCurrentFlightSetIdxEmitter.emit(this.currentFlightSetIndex);
}
//  hotels functions
// schedule functions
async getAllSchedules(){
  try {
    const data:any = await this.scheduleService.getSchedules();
    // console.log("===============================",data)
    // Store data in the service
    this.store.setData(data);
    this.allSchedules=data.cities;
  } catch (error) {
    console.log(error);
  }
}
// dialog box
showFlightOptions( toshowDialog:boolean ){
 this. isFlightOptionsAvailable=!this.isFlightOptionsAvailable;
}
}