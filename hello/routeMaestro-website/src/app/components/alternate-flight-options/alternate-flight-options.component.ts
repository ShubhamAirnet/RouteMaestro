import { Component, OnInit,Input, Output,EventEmitter } from '@angular/core';

@Component({
  selector: 'app-alternate-flight-options',
  templateUrl: './alternate-flight-options.component.html',
  styleUrls: ['./alternate-flight-options.component.scss']
})
export class AlternateFlightOptionsComponent implements OnInit {
 
  @Input() allFlightSets :any;
  @Input() currentFlightSetResultIdx :string;

  isSelected=false;

  @Output() highlightedFlightSetIdxChange = new EventEmitter<string>();
  hightlightedFlightSetIdx:string;
  constructor() { }

  ngOnInit(): void {
    console.log(this.allFlightSets);

    this.settingHighlightedFlightSet(this.currentFlightSetResultIdx);

  }

  settingHighlightedFlightSet(resultIdx: string) {
    this.allFlightSets.forEach(flightSet => {
      flightSet.isSelected = flightSet.resultIndex === resultIdx;

      if(flightSet.isSelected){
        this.hightlightedFlightSetIdx=flightSet.resultIndex;
        console.log(flightSet.resultIndex)
        console.log(this.hightlightedFlightSetIdx);
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










  isOpen = true;

  openModal() {
    this.isOpen = true;
  }

  closeModal() {
    this.isOpen = false;
  }



  

  
}
