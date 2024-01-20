import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Firestore,doc } from "@angular/fire/firestore";
import { getDoc } from "firebase/firestore";


@Injectable({
  providedIn: "root",
})
export class FlightsService {
  constructor(private http: HttpClient, private firestore:Firestore) {}

  authenticate(){
    return this.http.get("http://localhost:4000/flight/authenticate");
  }


  async searchFlights() {
    try {
      
        const payload={
          flightToken:localStorage.getItem("authenticateToken")
        }

        return new Promise((resolve, reject) => {
          this.http.post("http://localhost:4000/sendData", payload).subscribe(
            (data) => {
              
              console.log(data);
              resolve(data);
            },
            (err) => {
              console.log("not able to fetch the details", err);
              reject("No data available");
            }
          );
        });
      
    } catch (err) {
      console.log("error aa rha hai", err);
      return Promise.reject("Error in searching flights");
    }
  }
  

  async multiStopSearchFlights(){
    try {
      
      const payload={
        flightToken:localStorage.getItem("authenticateToken"),
        itineraryDocName:"updated_Itinerary"
      }

      return new Promise((resolve, reject) => {
        this.http.post("http://localhost:4000/flight/searchMultiStopFlights", payload).subscribe(
          (data) => {
            
            console.log(data);
            resolve(data);
          },
          (err) => {
            console.log("not able to fetch the details", err);
            reject("No data available");
          }
        );
      });
    
  } catch (err) {
    console.log("error aa rha hai", err);
    return Promise.reject("Error in searching flights");
  }
  }


}
