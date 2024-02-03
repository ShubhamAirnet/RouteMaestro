import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HotelsService } from 'src/app/Services/hotels_api/hotels.service';
import { Cashfree, load } from '@cashfreepayments/cashfree-js';
import { cashfree } from './util';
import axios from 'axios';
import { TransactionsService } from 'src/app/Services/transactions.service';

@Component({
  selector: 'app-package-checkout',
  templateUrl: './package-checkout.component.html',
  styleUrls: ['./package-checkout.component.scss']
})
export class PackageCheckoutComponent implements OnInit {
  NoOfRooms:number=0;
  NoOfAdults:number=0;
  NoOfChild:number=0;
  travelData:any;
  dialog:boolean=false;
  contactForm: FormGroup;
  Travellers:boolean=true;
  merchantShare:number=0;
  travelers:any;
  editIndex:number=0;
  @Input() TraceId:any;
  @Input() ResultIndex:any;
  transactionFee:number;
  totalCost:any;
  initialCost:any;
  loading:boolean;
  sessionId:string;
  version:string;
  pay:boolean=false;


  constructor(private auth:HotelsService,private fb: FormBuilder,private cdr: ChangeDetectorRef,private transact:TransactionsService) {
    
   }

  ngOnInit(): void {
    this.getData();
    this.initializeForm();
  }

  handleTravelerArrayChange(travelerArray: any[]): void {
    // Process the traveler array data received from the child component
    console.log(travelerArray);
    this.travelers=travelerArray;
    console.log(this.travelers)
    this.cdr.detectChanges();
    // ... other logic
  }
  private initializeForm(): void {
    this.contactForm = this.fb.group({
      name: ['', Validators.required],
      phone: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      address: [''],
      gst: [''],
      companyName: [''],
      companyNumber: [''],
      companyAddress: [''],
    });
  }

 

  dialogbox(index:number){
    console.log(index)
    this.dialog=!this.dialog;
    this.editIndex=index;
  }

  async submit(){
    this.pay=true
    console.log(this.contactForm.value)
    console.log(this.travelers)
    await this.auth.updatePrimaryContact(this.contactForm.value) 
    await this.auth.savePassengers(this.travelers)
  }

  async getData() {
    console.log('fetching');
    
    try {
      const res = await this.auth.getSearchInfo();
      console.log(res);
  
      if (res) {
        this.travelData = res;
        this.NoOfRooms = this.travelData.trip.RoomGuests.length;
        for(let i=0;i<this.travelData.trip.RoomGuests.length;i++){
          this.NoOfAdults+=this.travelData.trip.RoomGuests[i].NoOfAdults;
          this.NoOfChild+=this.travelData.trip.RoomGuests[i].NoOfChild;
        }
        this.totalCost = this.travelData.cost.flightCost+this.travelData.cost.hotelCost+this.travelData.cost.taxes
        this.initialCost=this.totalCost;

        console.log(this.NoOfRooms);
        console.log(this.NoOfAdults);
        console.log(this.NoOfChild);
        console.log(this.travelData);
        if(this.travelData?.passenger_details){
          this.travelers=this.travelData?.passenger_details
        }
        
      } else {
        console.log("No data received from getSearchInfo");
      }
    } catch (error) {
      console.log(error);
    }
  }

  toggleTerms() {
    const termsContainer = document.querySelector('.terms');
    const arrowDown = document.getElementById('arrowDown');
    const arrowUp = document.getElementById('arrowUp');

    termsContainer.classList.toggle('terms-expanded');
    arrowDown.classList.toggle('arrow-hidden');
    arrowUp.classList.toggle('arrow-hidden');
  }

  updateContainerHeight() {
    const container = document.getElementById('dynamicContainer');
    const boxCount = container.querySelectorAll('.box1').length;
    const newHeight = 180 + (boxCount * 40); // Adjust the value based on your styling
    container.style.height = `${newHeight}px`;
}
  addBox() {
    this.Travellers=!this.Travellers;
}
getArray(length: number): any[] {
  return new Array(length);
}

onMerchantShareChange() {
  console.log('Merchant Share changed:', this.merchantShare);

  const costChange = this.totalCost - this.initialCost;
  this.totalCost = this.initialCost + this.merchantShare;
  this.transactionFee = 0.00175 * this.totalCost;

  // Round to two decimal places
  this.transactionFee = +this.transactionFee.toFixed(2);

  // Update totalCost with the transaction fee
  this.totalCost += this.transactionFee;

  // Update initialTotalCost to the latest totalCost
  if(this.merchantShare==null || this.merchantShare===0){
    this.totalCost=this.initialCost
  }

  // Round totalCost to two decimal places
  this.totalCost = +this.totalCost.toFixed(2);

}


// Pay Now flow
getPaymentLink(){
  const formValues=this.contactForm.value;
  formValues.totalCost=this.totalCost;
  formValues.transactionFee=this.transactionFee;
  formValues.merchantShare=this.merchantShare;
  formValues.flightCost=this.travelData.cost.flightCost
  formValues.hotelCost=this.travelData.cost.taxes
  formValues.taxes=this.travelData.cost.hotelCost

  this.saveUserDetails(formValues);

}



async saveUserDetails(formValues:any){
  console.log('saving')
  try{
    const res=await this.transact.saveUserPaymentDetails(formValues);
    console.log(res)
   // Assuming 'this.router' is an instance of the Angular Router service
    this.getSessionId(res,formValues)




  }catch(error){
    console.log(error)
  }
}
 



async initializeCashfree(): Promise<void>  {
  try {
    const cashfree: Cashfree = await load({ mode: 'sandbox' }); // Adjust the initialization based on the actual structure of your Cashfree library
    this.version = cashfree.version(); // Assuming a default version
  } catch (error) {
    console.error('Error initializing Cashfree:', error);
  }
}

async getSessionId(order_id:string,form:any): Promise<void> {
  this.loading = true;

  try {
    const res = await axios.post('http://localhost:4000/createOrder', { version: this.version,form:form,order_id:order_id });
    this.loading = false;
    this.sessionId = res.data;
    if(res.data.success){
      // const redirectUrl = res.data.data.payments.url;
      // window.location.href = redirectUrl;
      // console.log(res.data.data)
      const sessionId=res.data.data.payment_session_id
      this.handlePayment(sessionId,order_id)
    }
  } catch (err) {
    this.loading = false;
    console.error('Error fetching sessionId:', err);
  }
}
handlePayment(sessionId:string,order_id:string): void {
  const checkoutOptions = {
    paymentSessionId: sessionId,
    returnUrl: `http://localhost:4200/success/${order_id}`,
  };

  cashfree.then((cf) => {
    cf.checkout(checkoutOptions).then(function(result){
      if (result.error) {
        alert(result.error.message);
      }
      if (result.redirect) {
        console.log("Redirection");
        console.log(result);
      }
    });
  });
}


// generate payment link flow

generatePaymentLink(){
  const formValues=this.contactForm.value;
  formValues.totalCost=this.totalCost;
  formValues.transactionFee=this.transactionFee;
  formValues.merchantShare=this.merchantShare;
  formValues.flightCost=this.travelData.cost.flightCost
  formValues.hotelCost=this.travelData.cost.taxes
  formValues.taxes=this.travelData.cost.hotelCost

  this.saveUserData(formValues);
}

async saveUserData(formValues:any){
  console.log('saving')
  try{
    const res=await this.transact.saveUserPaymentDetails(formValues);
    console.log(res)
   // Assuming 'this.router' is an instance of the Angular Router service
    this.generateLink(formValues,res)




  }catch(error){
    console.log(error)
  }
}

async generateLink(form:any,link_id:string){
  try{
    const res=await axios.post('http://localhost:4000/getPaymentLink',{form:form,version:this.version,link_id:link_id});
    const linkUrl = res.data.link_url;
    console.log(linkUrl)
    console.log(res.data)
    // Navigate to the generated URL
    // window.location.href = linkUrl;
  }catch(error){
    console.log(error)
  }
}
}
