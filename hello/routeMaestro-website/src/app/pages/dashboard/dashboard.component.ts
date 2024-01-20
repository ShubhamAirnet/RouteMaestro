import { Component} from '@angular/core';
import { FlightsService } from 'src/app/Services/flights_api/flights.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent  {

 // for additional information
 name: string = '';
 contact: string="" ;
 companyName: string = '';
 gst: string = '';
 pan: string = '';
 address: string = '';


   showDiv:boolean=true;

  constructor(private flight:FlightsService){}


  closeDiv() {
    this.showDiv = false;
  }

  openDiv() {
    this.showDiv = true;
  }


  // searchFlights(){

  //   this.flight.searchFlights().subscribe(
  //     (data)=>{
  //       console.log(data)
  //     },
  //     (error)=>{
  //       console.error("Error",error)
  //     }
  //   )
  // }
}
