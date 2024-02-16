import { Component, Input, OnInit } from '@angular/core';
import { PackageService } from 'src/app/Services/package/package.service';
import { ScheduleService } from 'src/app/Services/schedule_api/schedule.service';

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


  // hotel variables
  @Input()allHotels;

  cities:any;

  // will be calling flights and hotels from the itinerary page itself coz they are global(impacting fare Summary).
  // and will be calling schedules here coz they are already finalized in the first phase.
  constructor(private scheduleService: ScheduleService,private pack:PackageService ) {

  }

  ngOnInit(): void {
    this.getAllSchedules()
    console.log(this.allFlights)
    console.log(this.allHotels);
    this.settingCurrentFlightSetAndSegmentsArr(this.currentFlightSetIndex);
    this.updateFlightDetails(this.currentFlightSetSegmentsArray)
    console.log(this.currentFlightSetSegmentsArray)
  }

  async updateFlightDetails(flight: any) {
    try {
        const res = await this.pack.updateFlightDetails(flight);
        console.log("Flight details updated successfully:", res);
        return res; // Assuming you might want to return the result
    } catch (error) {
        console.error("Error updating flight details:", error);
        throw error; // Re-throw the error to propagate it further if needed
    }
}
  // flights functions

  settingCurrentFlightSetAndSegmentsArr(resultIndex:string){

    this.currentFlightSet=this.allFlights.filter(flightSet=>(flightSet.resultIndex===resultIndex));

    console.log(this.currentFlightSet)

    this.currentFlightSetSegmentsArray=this.currentFlightSet[0].segments;
    console.log( this.currentFlightSetSegmentsArray);

    this.isCurrentFlightSetLoaded=true;

    this.offeredFare=this.currentFlightSet[0].fare.OfferedFare;
    this.publishedFare=this.currentFlightSet[0].fare.PublishedFare;
    return

 }

 onHighlightedFlightSetIdxChange(highlightedFlightSetIdx: string) {
   // Handle the highlightedFlightSetIdx value received from the child component
   console.log('Received highlightedFlightSetIdx:', highlightedFlightSetIdx);

   this.currentFlightSetIndex=highlightedFlightSetIdx;
   this.settingCurrentFlightSetAndSegmentsArr(this.currentFlightSetIndex)
   console.log(this.currentFlightSetIndex)
 }



//  hotels functions


// schedule functions
async getAllSchedules(){

  try {
    const data = await this.scheduleService.getSchedules();
    console.log(data, "In component");
    this.cities=data

  } catch (error) {
    console.log(error);
  }

}





}
