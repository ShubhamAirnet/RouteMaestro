import { Component, EventEmitter, Input, NgZone, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HotelsService } from 'src/app/Services/hotels_api/hotels.service';

@Component({
  selector: 'app-traveller-card',
  templateUrl: './traveller-card.component.html',
  styleUrls: ['./traveller-card.component.scss']
})
export class TravellerCardComponent implements OnInit {
  @Input() dialog: boolean;
  @Output() closeDialog: EventEmitter<void> = new EventEmitter<void>();
  travelData:any;
  RoomGuest=[] as any[];
  NoOfTravellers:number=0;
  travelerForm: FormGroup;
  travelers: any[] = [];
  selectedCard: number | null = null;

  constructor(private auth:HotelsService,private fb: FormBuilder,private zone: NgZone) {
    // this.getData();
    this.initializeForm();
   }

   private initializeForm(): void {
    this.travelerForm = this.fb.group({
      personalInfo: this.fb.group({
        firstName: ['', Validators.required],
        lastName: ['', Validators.required],
        dateOfBirth: ['', Validators.required],
        gender: ['', Validators.required],
        nationality: ['', Validators.required],
        pan: [''],
        passportNo: [''],
        passportIssueDate: [''],
        passportExpiryDate: [''],
      }),
      ssr: this.fb.group({
        extraBaggage1: [''],
        extraBaggage2: [''],
        companyName: [''],
        gstNumber: [''],
        companyEmail: ['', Validators.email],
      }),
    });
  }
 
  addTraveler() {
    if (this.travelers.length < this.NoOfTravellers) {
      const newTraveler = { ...this.travelerForm.value };

      // Run the code inside Angular's zone
      this.zone.run(() => {
        this.travelers.push(newTraveler);
        console.log(this.travelers);

        // Clear form fields after adding a traveler
        this.travelerForm.reset();
        console.log(this.travelerForm);

        // Check if the array size matches the limit
        if (this.travelers.length === this.NoOfTravellers) {
          // Close the dialog if the array size matches the limit
          this.dialogbox();
        }
      });
    } else {
      console.warn('Cannot add more travelers. Reached the specified limit.');
    }
  }


  ngOnInit(): void {
    
  }
  selectCard(index: number): void {
    this.selectedCard = index;
  }

  dialogbox() {
    this.closeDialog.emit();
  }
  getArray(length: number): any[] {
    return new Array(length);
  }

  // async getData() {
  //   console.log('fetching');
    
  //   try {
  //     const res = await this.auth.getSearchInfo();
  //     console.log(res);
  
  //     if (res) {
  //       this.travelData = res;
  //       this.RoomGuest = this.travelData.trip.RoomGuests;
  //       for(let i=0;i<this.travelData.trip.RoomGuests.length;i++){
  //         this.NoOfTravellers+=this.travelData.trip.RoomGuests[i].NoOfAdults;
  //         this.NoOfTravellers+=this.travelData.trip.RoomGuests[i].NoOfChild;
  //       }
  //       console.log(this.RoomGuest)
  //       console.log(this.NoOfTravellers)
        
  //     } else {
  //       console.log("No data received from getSearchInfo");
  //     }
  //   } catch (error) {
  //     console.log(error);
  //   }
  // }

}
