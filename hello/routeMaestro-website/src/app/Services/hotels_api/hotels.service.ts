import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import {Firestore,doc,setDoc,} from "@angular/fire/firestore";

@Injectable({
  providedIn: 'root'
})
export class HotelsService {

  constructor(private http: HttpClient, private firestore:Firestore) {}

  authenticate(){
    return this.http.get("http://localhost:4000/flight/authenticate");
  }
  async updatePrimaryContact(form: any) {
    console.log("fetching");
  
    const searchDocRef = doc(this.firestore, "Demo_Itinerary", "updated_Itinerary");
  
    try {
      await setDoc(searchDocRef, { primary_details: form }, { merge: true });
      console.log("Document updated successfully!");
    } catch (error) {
      console.error("Error updating document:", error);
    }
  }
  async updatePassengers(form: any) {
    console.log("fetching");
  
    const searchDocRef = doc(this.firestore, "Demo_Itinerary", "updated_Itinerary");
  
    try {
      await setDoc(searchDocRef, { passenger_details: form }, { merge: true });
      console.log("Document updated successfully!");
    } catch (error) {
      console.error("Error updating document:", error);
    }
  }

  // ===============================================================================================================

  async getAllDetails(resultCount){
    try{

      const payload={
        authenticateToken:localStorage.getItem("authenticateToken"),
        resultCount
      }

      console.log(payload,"from front end")
     
      
      return new Promise((resolve, reject) => {
        this.http.post('http://localhost:4000/hotel/getIternary', payload).subscribe(
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
      
    }catch(error){
      console.log(error)
    }

   }








}
