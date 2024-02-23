import { ChangeDetectorRef, Component, EventEmitter, Input, NgZone, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { HotelsService } from 'src/app/Services/hotels_api/hotels.service';
import { PackageService } from 'src/app/Services/package/package.service';
import { DatePipe } from '@angular/common';
import { NgbDateStruct, NgbCalendar, NgbDateAdapter, NgbDateParserFormatter, NgbDatepicker } from '@ng-bootstrap/ng-bootstrap';


@Component({
  selector: 'app-traveller-card',
  templateUrl: './traveller-card.component.html',
  styleUrls: ['./traveller-card.component.scss']
})
export class TravellerCardComponent implements OnInit {
  @ViewChild('dpInput') dpInput: any;
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
  passengerData:any;
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
  shouldUpdateFormValues: boolean=false;

  isChild:boolean=false;

  // date
  selectedDate: Date;
  selectedDay: string | number = 'DD';
selectedMonth: string | number = 'MM';
selectedYear: string | number = 'YYYY';
  // Add any other necessary properties
  // In your component.ts
daysInMonthArray: (number | string)[] = [ ...Array.from({ length: 31 }, (_, i) => i + 1)];
monthsArray: (string | number)[] = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
yearsArray: (number | string)[] = [...Array.from({ length: new Date().getFullYear() - 1900 + 10 }, (_, i) => 1900 + i)];




  constructor(private hotels: HotelsService,   private fb: FormBuilder, private datePipe: DatePipe, private zone: NgZone,private cdr: ChangeDetectorRef,private pack:PackageService) {
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

  adult(){
    this.isChild=false
  }
  child(){
    this.isChild=true
  }
  get minDate(): string {
    const currentDate = new Date();
    const minYear = currentDate.getFullYear() - (this.isChild ? 12 : 0);
    const minDateString = `${minYear}-${this.formatNumber(currentDate.getMonth() + 1)}-${this.formatNumber(currentDate.getDate())}`;
    return minDateString;
}
private formatNumber(num: number): string {
  return num < 10 ? `0${num}` : `${num}`;
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
  formatDate(day: string, month: string, year: string): string {
    // Assuming day, month, and year are strings
    const formattedDay = day.padStart(2, '0');
    const formattedMonth = month.padStart(2, '0');
    const formattedYear = year.padStart(4, '0');
  
    return `${formattedYear}-${formattedMonth}-${formattedDay}T00:00:00`;
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
        FirstName: ['', Validators.required],
        Title: ['', Validators.required],
        LastName: ['', Validators.required],
        DateOfBirth: [''],
        Gender: ['', Validators.required],
        Nationality: ['', Validators.required],
        AddressLine1: ['', Validators.required],
        AddressLine2: [''],
        Email: ['', Validators.required],
        ContactNo: ['', Validators.required],
        Phoneno: [''],
        PAN: [''],
        PassportNo: [''],
        PassportIssueDate: [''],
        PassportExpDate: [''],
        PassportExpiry: [''],
        Age: [''],
        PaxType: [''],
        CountryCode: [''],
        City: [''],
        CountryName: [''],
        LeadPassenger: [true]
      }),
      dates:this.fb.group({
        dob:this.fb.group({
          day:['',Validators.required],
          month:['',Validators.required],
          year:['',Validators.required]
        }),
        passportIssue:this.fb.group({
          day:['',Validators.required],
          month:['',Validators.required],
          year:['',Validators.required]
        }),
        passportExpiry:this.fb.group({
          day:['',Validators.required],
          month:['',Validators.required],
          year:['',Validators.required]
        })
      }),
      guardianDetails:this.fb.group({
        Title:[''],
        FirstName:[''],
        LastName:[''],
        PAN:[''],
        PassportNo:[''],
      }),
      ssr: this.fb.group({
        extraBaggage: new FormControl(),
        meal: new FormControl(),
        seat: new FormControl()
      }),
    });

    this.travelerForm.get('personalInfo.ContactNo').valueChanges.subscribe((contactNo) => {
      // Check if the flag is set to true before updating the form

        // Set the value of Phoneno field to the same value as ContactNo
        this.travelerForm.get('personalInfo.Phoneno').setValue(contactNo);
      
    });
  
    // Subscribe to value changes for Date of Birth
  

  }


  onDateChange(controlName: string) {
    const selectedDay = this.travelerForm.get(`dates.${controlName}.day`).value;
    const selectedMonth = this.travelerForm.get(`dates.${controlName}.month`).value;
    const selectedYear = this.travelerForm.get(`dates.${controlName}.year`).value;
  
    if (selectedDay !== null && selectedMonth !== null && selectedYear !== null) {
      const formattedDate = this.formatDate(selectedDay, selectedMonth, selectedYear);
      console.log(formattedDate);
      this.someFunctionToUpdateDate(controlName, formattedDate);
    }
  }
  
  someFunctionToUpdateDate(controlName: string, formattedDate: string) {
    
    if(controlName==='dob'){
      this.travelerForm.get('personalInfo.DateOfBirth').setValue(formattedDate)
      const age=this.calculateAgeFromDateOfBirth(formattedDate);
      this.travelerForm.get('personalInfo.Age').setValue(age);
      if(age>=12){
        this.travelerForm.get('personalInfo.PaxType').setValue(1);
      }else{
        this.travelerForm.get('personalInfo.PaxType').setValue(2)
      }
      console.log(age)
    }else if(controlName==='passportIssue'){
      this.travelerForm.get('personalInfo.PassportIssueDate').setValue(formattedDate);
    }else if(controlName==='passportExpiry'){
      this.travelerForm.get('personalInfo.PassportExpDate').setValue(formattedDate);
        this.travelerForm.get('personalInfo.PassportExpiry').setValue(formattedDate);
    }
    console.log(this.travelerForm)
  }
  
  
  calculateAgeFromDateOfBirth(dateOfBirth: string): number {
    // Extracting year, month, and day from the input date
    const parts = dateOfBirth.split('T')[0].split('-');
    const birthYear = parseInt(parts[0], 10);
    const birthMonth = parseInt(parts[1], 10);
    const birthDay = parseInt(parts[2], 10);
  
    // Creating a Date object from the input date
    const birthDate = new Date(birthYear, birthMonth - 1, birthDay);
  
    // Calculating age
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
  
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
  
    return age;
  }
  
  
  
  
  
  
  

  




  calculateTotalAdultsCount(i: number): number {
    let total = 0;

    for (let k = i; k > 0; k--) {
      total += this.RoomGuest[k - 1]?.NoOfAdults + this.RoomGuest[k - 1]?.NoOfChild || 0;
    }

    return total;
  }

  addTraveler() {
    console.log('added-start')
  this.shouldUpdateFormValues=true
  
    console.log('length', this.travelers);
    

    console.log('length after')
  
    const newTraveler = { ...this.travelerForm.value };
    console.log(newTraveler)
    
  console.log('in middle')
    // Save passenger data asynchronously
    this.savePassengerData(this.travelerForm.value)
      console.log(this.travelerForm.value);
  
      this.travelers[this.currentIndex] = this.travelerForm.value;
      this.editIndex = undefined;
      console.log('in midldle')
      // Reset the form inside the asynchronous block
      this.travelerForm.reset();
  
      this.travelerArrayChange.emit(this.travelers);
  
      if (this.currentTravellerCount < this.NoOfTravellers) {
        this.currentTravellerCount++;
       
      }
  
      if (this.currentTravellerCount >= this.NoOfTravellers) {
        this.dialogbox();
      }
      this.selectedCard++;
      this.currentIndex++;
      this.shouldUpdateFormValues=false
  
      console.log('added-end')
    
  }
  
  
  async savePassengerData(form: any) {
    try {
      const res = await this.pack.savePerPassengerData(form,this.currentIndex);
      console.log(res);
    } catch (error) {
      console.log(error);
    }
  }

  updateTraveller() {
    console.log('in update')
    this.shouldUpdateFormValues=true
    const updatedTraveler = { ...this.travelerForm.value };
    console.log('update')
    console.log(updatedTraveler)
    // Update the DateOfBirth control separately with the formatted date

    // Merge the updated values into the existing traveler
    this.travelers[this.currentIndex] = {
      ...this.travelers[this.currentIndex],
      ...this.travelerForm.value,
    };
    console.log('update+++')

    // Call the updatePassengerData method with the updated traveler data
   
    this.savePassengerData(this.travelers);
    console.log(this.travelers)
    console.log('in update end')
    this.shouldUpdateFormValues=false
  }
  
  

  async updatePassengerData(form: any) {
    try {
      const res = await this.pack.updatePassengerDetails(form, this.currentIndex);
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
      const res = await this.hotels.getSearchInfo();
      console.log(res);

      if (res) {
        this.travelData = res;
        this.RoomGuest = this.travelData?.trip?.RoomGuests;
        for (let i = 0; i < this.travelData?.trip?.RoomGuests?.length; i++) {
          this.NoOfTravellers += this.travelData?.trip?.RoomGuests[i]?.NoOfAdults;
          this.NoOfTravellers += this.travelData?.trip?.RoomGuests[i]?.NoOfChild;
        }
        console.log(this.RoomGuest);
        console.log('no',this.NoOfTravellers);
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
      const travelerData = this.travelers[this.currentIndex];
      console.log(this.travelData)

      if (travelerData) {
        this.travelerForm.patchValue({
          personalInfo: {
            FirstName: travelerData?.personalInfo?.FirstName || '',
            Title: travelerData?.personalInfo?.Title || '',
            LastName: travelerData?.personalInfo?.LastName || '',
            DateOfBirth: travelerData?.personalInfo?.DateOfBirth || '',
            Gender: travelerData?.personalInfo?.Gender || '',
            Nationality: travelerData?.personalInfo?.Nationality || '',
            PAN: travelerData?.personalInfo?.PAN || '',
            AddressLine1: travelerData?.personalInfo?.AddressLine1|| '',
            AddressLine2: travelerData?.personalInfo?.AddressLine2|| '',
            Email: travelerData?.personalInfo?.Email || '',
            ContactNo: travelerData?.personalInfo?.ContactNo || '',
            PassportNo: travelerData?.personalInfo?.PassportNo || '',
            PassportIssueDate: travelerData?.personalInfo?.PassportIssueDate || '',
            PassportExpiryDate: travelerData?.personalInfo?.PassportExpiryDate || '',
            Age: travelerData?.personalInfo?.Age || '',
            City: travelerData?.personalInfo?.City || '',
            Country: travelerData?.personalInfo?.Country || '',
           
          },
          dates:{
            dob:{
              day:travelerData?.dates?.dob?.day || '',
              month:travelerData?.dates?.dob?.month || '',
              year:travelerData?.dates?.dob?.year || '',
            },
            passportIssue:{
              day:travelerData?.dates?.passportIssue?.day || '',
              month:travelerData?.dates?.passportIssue?.month || '',
              year:travelerData?.dates?.passportIssue?.year || '',
            },
            passportExpiry:{
              day:travelerData?.dates?.passportExpiry?.day || '',
              month:travelerData?.dates?.passportExpiry?.month || '',
              year:travelerData?.dates?.passportExpiry?.year || '',
            }

          },
          guardianDetails:{
            Title:travelerData?.guardianDetails?.Title || '',
            FirstName:travelerData?.guardianDetails?.FirstName || '',
            LastName:travelerData?.guardianDetails?.LastName || '',
            PAN:travelerData?.guardianDetails?.PAN || '',
            PassportNo:travelerData?.guardianDetails?.PassportNo || '',
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
