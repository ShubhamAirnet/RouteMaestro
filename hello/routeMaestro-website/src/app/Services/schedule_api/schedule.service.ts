import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import axios from 'axios';

@Injectable({
  providedIn: 'root'
})
export class ScheduleService {

  constructor(private http: HttpClient) {}


  async getSchedules(){

    try{

      const {data}=await axios.get("  http://localhost:4000/schedule/getItinerarySchedule");
      console.log(data)
      return data

      // return new Promise((resolve, reject) => {
      //   this.http.get("http://localhost:4000/schedule/getItinerarySchedule").subscribe(
      //     (data) => {
            
      //       console.log(data);
      //       resolve(data);
      //     },
      //     (err) => {
      //       console.log("not able to fetch the details", err);
      //       reject("No data available");
      //     }
      //   );
      // });


    }
    catch(err){
      console.log("error aa rha hai", err);
      return Promise.reject("Error in searching flights");
    }


  }

}
