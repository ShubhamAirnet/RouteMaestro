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
export class PackageService {

  constructor(private firestore:Firestore) { }

  async updateFlightDetails(form: any[][]) {
    try {
        const packageDocRef = doc(this.firestore, "package_data", "QNHo0JCIB4bDXBSNqKo9");

        // Transform the form array into the desired structure
        const transformedForm = form.map(trip => {
            const tripObject = {};

            // Assign each object in the inner array to a trip property
            trip.forEach((obj, index) => {
                tripObject[`trip${index + 1}`] = obj;
            });

            return tripObject;
        });

        // Get the existing document data
        const packageDocSnapshot = await getDoc(packageDocRef);

        // Check if 'flight_details' field exists in the document
        if (packageDocSnapshot.exists() && packageDocSnapshot.data()?.flight_details) {
            // Update the 'segments' property within the existing 'flight_details' object
            await setDoc(packageDocRef, { 'flight_details': { 'segments': transformedForm } }, { merge: true });
        } else {
            // If 'flight_details' doesn't exist or the entire field is absent, create it
            await setDoc(packageDocRef, { 'flight_details': { 'segments': transformedForm } }, { merge: true });
        }

        console.log("Flight details updated successfully!");
    } catch (error) {
        console.error("Error updating flight details:", error);
        throw error;
    }
}
  async updateHotelDetails(form: any[][]) {
    try {
        const packageDocRef = doc(this.firestore, "package_data", "QNHo0JCIB4bDXBSNqKo9");

        // Transform the form array into the desired structure
        const transformedForm = form.map(trip => {
            const tripObject = {};

            // Assign each object in the inner array to a trip property
            trip.forEach((obj, index) => {
                tripObject[`trip${index + 1}`] = obj;
            });

            return tripObject;
        });

        // Get the existing document data
        const packageDocSnapshot = await getDoc(packageDocRef);

        // Check if 'flight_details' field exists in the document
        if (packageDocSnapshot.exists() && packageDocSnapshot.data()?.flight_details) {
            // Update the 'segments' property within the existing 'flight_details' object
            await setDoc(packageDocRef, { 'hotel_details': { 'segments': transformedForm } }, { merge: true });
        } else {
            // If 'flight_details' doesn't exist or the entire field is absent, create it
            await setDoc(packageDocRef, { 'flight_details': { 'segments': transformedForm } }, { merge: true });
        }

        console.log("Flight details updated successfully!");
    } catch (error) {
        console.error("Error updating flight details:", error);
        throw error;
    }
}







}
