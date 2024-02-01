import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HotelsService } from 'src/app/Services/hotels_api/hotels.service';

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

  constructor(private auth:HotelsService,private fb: FormBuilder) {
    
   }

  ngOnInit(): void {
    this.getData();
    this.initializeForm();
  }
  private initializeForm(): void {
    this.contactForm = this.fb.group({
      name: ['', Validators.required],
      phone: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      address: [''],
      gst: [''],
      pan: [''],
    });
  }

 

  dialogbox(){
    this.dialog=!this.dialog;
  }

  async submit(){
    console.log(this.contactForm.value)
    await this.auth.updatePrimaryContact(this.contactForm.value)
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

        console.log(this.NoOfRooms);
        console.log(this.NoOfAdults);
        console.log(this.NoOfChild);
        console.log(this.travelData);
        
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


 
}
