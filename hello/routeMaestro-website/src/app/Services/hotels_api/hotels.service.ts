import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";

import axios from 'axios';
import {
  Firestore,
  collection,
  getDocs,
  query,
  where,
  getDoc,
  doc,
  Timestamp,
  setDoc,
  onSnapshot,
  DocumentData,
  QuerySnapshot
} from "@angular/fire/firestore";


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

  async getAllDetails(resultCount) {
    const token=localStorage.getItem("authenticateToken")
    try {
      const {data} = await axios.post('http://localhost:4000/hotel/getIternary', { resultCount: resultCount,token:token });
      console.log(data);
      return data;
    } catch (error) {
      console.log(error);
    }
  }

  async getSearchInfo() {
    console.log("fetching");
    const searchDocRef = doc(this.firestore, "Demo_Itinerary", "updated_Itinerary");
    return new Promise((resolve, reject) => {
      const unsubscribe = onSnapshot(
        searchDocRef,
        (data) => {
          if (data.exists()) {
            unsubscribe();
            console.log(data.data());
            resolve(data.data());
          } else {
            unsubscribe();
            console.log("data not present");
            reject("data not present");
          }
        },
        (error) => {
          unsubscribe();
          console.error("Error fetching data:", error);
          reject(error);
        }
      );
    });
  }

}
