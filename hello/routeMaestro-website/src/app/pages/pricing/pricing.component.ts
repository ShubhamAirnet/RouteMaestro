import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import {
  trigger,
  state,
  style,
  animate,
  transition,
} from "@angular/animations";
import { PlansService } from "src/app/Services/plans/plans.service";
import { PlanCheckoutService } from "src/app/Services/plan_checkout/plan-checkout.service";


@Component({
  selector: "app-pricing",
  templateUrl: "./pricing.component.html",
  styleUrls: ["./pricing.component.scss"],
  animations: [
    trigger("fadeInOut", [
      state(
        "void",
        style({
          opacity: 0,
          height: "0px",
        })
      ),
      transition("void <=> *", animate(300)),
    ]),
  ],
})
export class PricingComponent implements OnInit {
  
  
  constructor(private plansCheckoutService:PlanCheckoutService ,private router: Router,private planService:PlansService) {}
 
  navigationToCheckout(event:any) {

    this.router.navigate(["/dashboard"]);
    // let price:number;

    // console.log(event);
    // if(event.target.value==='basic'){
    //  price=5500
    // }
    // else if(event.target.value==='pro'){
    //   price=10500;
    // }
    // const packageSelected={
    //   package:event.target.value,  
    //   price
    // }

    this.plansCheckoutService.makingPayment("free");
    // this.planService.buyPlan(event.target.value);


    // this.router.navigate(["/Checkout",packageSelected]);
  }

  // Use properties to track the visibility of the answer
  isAnswerVisible1 = false;
  isAnswerVisible2 = false;
  isAnswerVisible3 = false;

  // Toggle the visibility of the answer
  toggleAnswer1() {
    this.isAnswerVisible1 = !this.isAnswerVisible1;
  } 
  toggleAnswer2() {
    this.isAnswerVisible2 = !this.isAnswerVisible2;
  }
   toggleAnswer3() {
    this.isAnswerVisible3 = !this.isAnswerVisible3;
  }

  ngOnInit(): void {}
}
