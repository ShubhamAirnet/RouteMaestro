import { Injectable } from "@angular/core";
import { Firestore, doc, setDoc, Timestamp } from "@angular/fire/firestore";
import { AuthService } from "../auth.service";
import { getDoc } from "firebase/firestore";

@Injectable({
  providedIn: "root",
})
export class PlansService {
  constructor(private firestore: Firestore, private authService: AuthService) {}


  async buyPlan(planName: string) {
    const uid = await this.authService.getUserUid();
    console.log(uid);

    let planRef;

    if (planName === "free") {
      planRef = "/Plans/free";
    } else if (planName === "basic") {
      planRef = "/Plans/basic";
    } else if (planName === "pro") {
      planRef = "/Plans/pro";
    }

    if (uid) {
      const start_date = Timestamp.now();
      const currentDate = start_date.toDate();
      // Increment the timestamp by 30 days
      const end_date = new Date(currentDate);
      end_date.setDate(currentDate.getDate() + 30);

      console.log(end_date);

      const payload = {
        start_date,
        end_date,
        planRef,
        status: "active",
      };

      let docRef = doc(this.firestore, "users", `${uid}`, "plan", "details");

      await setDoc(docRef, payload);


     
    }
  }
}
