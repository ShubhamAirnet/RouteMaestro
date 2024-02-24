import { Component, OnInit,Input, Output,EventEmitter } from '@angular/core';

@Component({
  selector: 'app-alternate-flight-options',
  templateUrl: './alternate-flight-options.component.html',
  styleUrls: ['./alternate-flight-options.component.scss']
})
export class AlternateFlightOptionsComponent implements OnInit {
 
  isOpen = true;

  @Input() allFlightSets :any;
  @Input() currentFlightSetResultIdx :string;

 // filters variable
 isRefundable:boolean=false;
 isNonRefundable:boolean=true;
 isLCC:boolean=false;
 isNonLCC:boolean=true;
 isFiltered:boolean=false;
 filteredFlights:any;
 numberOfStopsFilter: number=1;
 airline=[];
 airlineNames: Set<string> = new Set();

 selectedRefundable: string | null = null;
 selectedNonRefundable: string | null = null;
 selectedLCC: string | null = null;
 selectedNonLCC: string | null = null;

  @Output() highlightedFlightSetIdxChange = new EventEmitter<string>();
  hightlightedFlightSetIdx:string;

  constructor() { }

  ngOnInit(): void {
   


    this.applyFilters()


    this.settingHighlightedFlightSet(this.currentFlightSetResultIdx);

  }

  toggleRefundable(isChecked: string) {
    if(isChecked){
      this.isRefundable=true;
    }else{
      this.isRefundable=false;
    }
    
   
    this.applyFilters()
  }
  toggleNonRefundable(isChecked: string) {
    
    if(isChecked){
      this.isNonRefundable=true;
    }else{
      this.isNonRefundable=false;
    }
    this.applyFilters()
  }

  toggleLCC(isChecked: string) {
   
    if(isChecked){
      this.isLCC=true;
    }else{
      this.isLCC=false;
    }
    this.applyFilters()
  }
  toggleNonLCC(isChecked: string) {
 
    if(isChecked){
      this.isNonLCC=true;
    }else{
      this.isNonLCC=false;
    }
    this.applyFilters()
  }
  toggleStops(value:number,isChecked:boolean){
    if(isChecked){
      this.numberOfStopsFilter=value;
    }else{
      this.numberOfStopsFilter=null;
    }
    console.log(this.numberOfStopsFilter)
    this.applyFilters()
  }

  settingHighlightedFlightSet(resultIdx: string) {
    this.allFlightSets.forEach(flightSet => {
      flightSet.isSelected = flightSet.resultIndex === resultIdx;

      if(flightSet.isSelected){
        this.hightlightedFlightSetIdx=flightSet.resultIndex;
        // console.log(flightSet.resultIndex)
        // console.log(this.hightlightedFlightSetIdx);
      }
    });
  }
  
  getIdxValue(flightSet: any) {
    return flightSet.resultIndex;
  }
  
  showValue(flightSet: any) {
    this.settingHighlightedFlightSet(this.getIdxValue(flightSet));
  }

  sendHighlightedFlightSetIdx(){
     // Emit the value to the parent component
     this.highlightedFlightSetIdxChange.emit(this.hightlightedFlightSetIdx);

    this.closeModal()
  }



// filtering functions

filterFlights() {
  if (this.isFiltered) {
    this.filteredFlights = this.allFlightSets.filter((item) => {
      const refundableCondition = !this.isRefundable || item.isRefundable === this.isRefundable;
      const nonRefundable=!this.isNonRefundable || item.isRefundable === false;
      const nonLccCondiation=!this.isNonLCC || item.isLCC === false;
      const lccCondition = !this.isLCC || item.isLCC === this.isLCC;
      const airlineCondition =
      this.airline.length === 0 ||
      item.segments.some((sector) =>
        sector.some((key) => this.airline.includes(key.Airline.AirlineName))
      );
          const stopsCondition = this.numberOfStopsFilter === null || item.segments.some((sector) => sector.length - 1 === this.numberOfStopsFilter);

      // Combine conditions using logical AND
      const combinedCondition = refundableCondition && lccCondition && airlineCondition && stopsCondition && nonLccCondiation && nonRefundable;

      return combinedCondition;
    });
  } else {
    // Include all data when no filters are active
    this.filteredFlights = this.allFlightSets;
  }

  console.log('filtered ', this.filteredFlights);
  this.getAirlineNames(this.filteredFlights);
}




// Call this function whenever any of the filter conditions change
applyFilters() {
  this.isFiltered=true;
  this.filterFlights();
}

//  to get all unique airline Names

getAirlineNames( flights:any){
  flights.map((item)=>{
    item.segments.map((sectors)=>{
      sectors.map((key)=>{
        this.airlineNames.add(key.Airline.AirlineName)
      })
    })
  })
  console.log('names',this.airlineNames)
}

updateNamesArray(sector: any, isChecked: boolean){
  if (isChecked) {
    this.airline.push(sector);
   
  } else {
    // Remove the sector from the array
    const index = this.airline.findIndex(s => s === sector);
    if (index !== -1) {
      this.airline.splice(index, 1);
    }
    
  }
  console.log(this.airline)
    this.applyFilters()
}






  openModal() {
    this.isOpen = true;
  }

  closeModal() {
    this.isOpen = false;
  }



  

  
}
