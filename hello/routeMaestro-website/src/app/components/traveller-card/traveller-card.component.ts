import { ChangeDetectorRef, Component, EventEmitter, Input, NgZone, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { HotelsService } from 'src/app/Services/hotels_api/hotels.service';

@Component({
  selector: 'app-traveller-card',
  templateUrl: './traveller-card.component.html',
  styleUrls: ['./traveller-card.component.scss']
})
export class TravellerCardComponent implements OnInit {
  @Input() dialog: boolean;
  @Input() editIndex: number;
  @Input() ssr: any;
  @Input() seatPrice: any;
  @Input() baggagePrice: any;
  @Input()  travelers: any[] = [];
  @Input() mealPrice: any;
  @Output() closeDialog: EventEmitter<void> = new EventEmitter<void>();
  @Output() travelerArrayChange: EventEmitter<any[]> = new EventEmitter<any[]>();
  travelData: any;
  RoomGuest = [] as any[];
  NoOfTravellers: number = 0;
  travelerForm: FormGroup;
 
  selectedCard: number = 0;
  currentTravellerCount = 1;
  totalAdultsCount: number = 0;
  primary: boolean = false;
  currentIndex: number = 0;
  ssrData: any;
  seatMapDialog: boolean = false;

  constructor(private auth: HotelsService, private fb: FormBuilder, private zone: NgZone,private cdr: ChangeDetectorRef) {
    this.getData();
    this.initializeForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log("HotelCardsComponent ngOnChanges", changes);
    console.log(this.editIndex)
    console.log(this.ssr.Response)
    this.ssrData = this.ssr.Response
    console.log(this.ssrData)
    console.log(this.travelers)
  }

  ngOnInit(): void {
    if (this.editIndex !== undefined) {
      this.handleCardClick(this.editIndex)
      console.log(this.editIndex)
      console.log(this.travelers)
      this.currentIndex=this.editIndex;
      if(this.travelers[this.currentIndex]){
        this.travelerForm.setValue(this.travelers[this.currentIndex]);
        console.log(this.travelerForm.value)
      }
     
    }

 
  }

  handleSeatMapClick() {
    this.seatMapDialog = !this.seatMapDialog;
  }

  handleSeatMapData(data: any) {
    console.log('Received data from seat map component:', data);
    this.travelerForm.get('ssr.seat')?.setValue(data);
  }

  private initializeForm(): void {
    this.travelerForm = this.fb.group({
      personalInfo: this.fb.group({
        firstName: ['', Validators.required],
        title: ['', Validators.required],
        lastName: ['', Validators.required],
        dateOfBirth: ['', Validators.required],
        gender: ['', Validators.required],
        nationality: ['', Validators.required],
        addressLine1: ['', Validators.required],
        addressLine2: ['', Validators.required],
        email: [''],
        phone: [''],
        pan: [''],
        passportNo: [''],
        passportIssueDate: [''],
        passportExpiryDate: [''],
        primary: [false]
      }),
      ssr: this.fb.group({
        extraBaggage:  new FormControl(),
        meal:  new FormControl(),
        seat:  new FormControl()
      }),
    });
  }

  primaryUser() {
    this.primary = !this.primary;
  }

  calculateTotalAdultsCount(i: number): number {
    let total = 0;

    for (let k = i; k > 0; k--) {
      total += this.RoomGuest[k - 1]?.NoOfAdults + this.RoomGuest[k - 1]?.NoOfChild || 0;
    }

    return total;
  }

  addTraveler() {
    this.currentIndex++;
    if (this.currentTravellerCount < this.NoOfTravellers) {
      this.currentTravellerCount++;
   
    }
  

    if (this.travelers.length < this.NoOfTravellers) {
      const newTraveler = { ...this.travelerForm.value };
      this.savePassengerData(newTraveler)

      if (this.editIndex !== undefined) {
        this.travelers[this.editIndex] = newTraveler;
        this.editIndex = undefined;
        this.travelerForm.setValue(newTraveler);
      } else {
        this.travelers.push(newTraveler);
      }

      this.travelerForm.reset();
      this.travelerArrayChange.emit(this.travelers);

      if (this.travelers.length === this.NoOfTravellers) {
        this.dialogbox();
      }
    } else {
      console.warn('Cannot add more travelers. Reached the specified limit.');
    }
  }

  async savePassengerData(form: any) {
    try {
      const res = await this.auth.savePassengers(form);
      console.log(res);
    } catch (error) {
      console.log(error);
    }
  }

  updateTraveller() {
    const updatedTraveler = { ...this.travelerForm.value };
    console.log(updatedTraveler)
    // Merge the updated values into the existing traveler
    this.travelers[this.currentIndex] = {
      ...this.travelers[this.currentIndex],
      ...updatedTraveler
    };
  
    // Update the form with the merged traveler data
    this.travelerForm.patchValue(this.travelers[this.currentIndex]);
  
    // Call the updatePassengerData method with the updated traveler data
    this.updatePassengerData(this.travelers[this.currentIndex]);
  }
  

  async updatePassengerData(form: any) {
    try {
      const res = await this.auth.updatePassengers(form, this.currentIndex);
      console.log(res)
      this.travelerArrayChange.emit(res);
    } catch (error) {
      console.log(error)
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
    this.NoOfTravellers = 0;

    try {
      const res = await this.auth.getSearchInfo();
      console.log(res);

      if (res) {
        this.travelData = res;
        this.RoomGuest = this.travelData?.trip?.RoomGuests;
        for (let i = 0; i < this.travelData?.trip?.RoomGuests?.length; i++) {
          this.NoOfTravellers += this.travelData?.trip?.RoomGuests[i]?.NoOfAdults;
          this.NoOfTravellers += this.travelData?.trip?.RoomGuests[i]?.NoOfChild;
        }
        console.log(this.RoomGuest);
        console.log(this.NoOfTravellers);
      } else {
        console.log("No data received from getSearchInfo");
      }
    } catch (error) {
      console.log(error);
    }
  }

  handleCardClick(index: number) {
    console.log('Before update:', this.currentIndex);
       
    this.zone.run(() => {
      // this.editIndex=index;
      this.currentIndex = index;
      console.log(this.currentIndex)
      this.selectedCard = index;
      this.cdr.detectChanges();
      const travelerData = this.travelData?.passenger_details[this.currentIndex];
      console.log(this.travelData)

      if (travelerData) {
        this.travelerForm.patchValue({
          personalInfo: {
            firstName: travelerData?.personalInfo?.firstName || '',
            title: travelerData?.personalInfo?.title || '',
            lastName: travelerData?.personalInfo?.lastName || '',
            dateOfBirth: travelerData?.personalInfo?.dateOfBirth || '',
            gender: travelerData?.personalInfo?.gender || '',
            nationality: travelerData?.personalInfo?.nationality || '',
            pan: travelerData?.personalInfo?.pan || '',
            address: travelerData?.personalInfo?.address || '',
            email: travelerData?.personalInfo?.email || '',
            phone: travelerData?.personalInfo?.phone || '',
            passportNo: travelerData?.personalInfo?.passportNo || '',
            passportIssueDate: travelerData?.personalInfo?.passportIssueDate || '',
            passportExpiryDate: travelerData?.personalInfo?.passportExpiryDate || '',
          },
          ssr: {
            extraBaggage: travelerData?.ssr?.extraBaggage || '',
            meal: travelerData?.ssr?.meal || '',
        
            seat: travelerData?.ssr?.seat || '',
          },
        });
        console.log(this.travelerForm.value)
      }
    });
  }
}
