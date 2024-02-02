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
  @Input() editIndex: number;
  @Output() closeDialog: EventEmitter<void> = new EventEmitter<void>();
  @Output() travelerArrayChange: EventEmitter<any[]> = new EventEmitter<any[]>();
  travelData:any;
  RoomGuest=[] as any[];
  NoOfTravellers:number=0;
  travelerForm: FormGroup;
  travelers: any[] = [];
  selectedCard: number | null = null;
  currentTravellerCount = 1;

  constructor(private auth:HotelsService,private fb: FormBuilder,private zone: NgZone) {
    this.getData();
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
 
  selectCard(roomIndex: number, cardIndex: number): void {
  this.selectedCard = roomIndex * 4 + cardIndex;
}

isSelected(roomIndex: number, cardIndex: number): boolean {
  return this.selectedCard === roomIndex * 4+ cardIndex;
}
addTraveler() {
  console.log(this.travelers)
  if (this.currentTravellerCount < this.NoOfTravellers) {
    this.currentTravellerCount++;
  }

  if (this.travelers.length < this.NoOfTravellers) {
    const newTraveler = { ...this.travelerForm.value };

    // If there is an editIndex, update the existing traveler data
    if (this.editIndex !== undefined) {
      this.travelers[this.editIndex] = newTraveler;
      this.editIndex = undefined; // Reset editIndex after updating

      // Update the form fields in real time
      this.travelerForm.patchValue(newTraveler);
    } else {
      // If no editIndex, add a new traveler
      this.travelers.push(newTraveler);
    }

    // Clear form fields after adding or editing a traveler
    this.travelerForm.reset();

    // Emit the updated travelers array
    this.travelerArrayChange.emit(this.travelers);

    // Check if the array size matches the limit
    if (this.travelers.length === this.NoOfTravellers) {
      // Close the dialog if the array size matches the limit
      this.dialogbox();
    }
  } else {
    console.warn('Cannot add more travelers. Reached the specified limit.');
  }
}






  ngOnInit(): void {
    if (this.editIndex !== undefined) {
      // If editIndex is provided, initialize form values with existing data
      this.travelerForm.setValue(this.travelers[this.editIndex]);
    }
    
  }
 

  dialogbox() {
    this.closeDialog.emit();
  }
  getArray(length: number): any[] {
    return new Array(length);
  }

  async getData() {
    console.log('fetching');
    
    try {
      const res = await this.auth.getSearchInfo();
      console.log(res);
  
      if (res) {
        this.travelData = res;
        this.RoomGuest = this.travelData.trip.RoomGuests;
        for(let i=0;i<this.travelData.trip.RoomGuests.length;i++){
          this.NoOfTravellers+=this.travelData.trip.RoomGuests[i].NoOfAdults;
          this.NoOfTravellers+=this.travelData.trip.RoomGuests[i].NoOfChild;
        }
        console.log(this.RoomGuest)
        console.log(this.NoOfTravellers)
        
      } else {
        console.log("No data received from getSearchInfo");
      }
    } catch (error) {
      console.log(error);
    }
  }

}
