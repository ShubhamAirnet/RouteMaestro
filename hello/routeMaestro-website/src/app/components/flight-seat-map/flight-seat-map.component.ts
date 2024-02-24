import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-flight-seat-map',
  templateUrl: './flight-seat-map.component.html',
  styleUrls: ['./flight-seat-map.component.scss']
})
export class FlightSeatMapComponent implements OnInit {
  @Input() seatMapDialog: boolean;
  @Input() ssr: boolean;
  @Output() seatMapData = new EventEmitter<any>();
  @Output() closeDialog: EventEmitter<void> = new EventEmitter<void>();
  ssrData: any;
  seatMapForm: FormGroup;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.ssrData = this.ssr;

    // Initialize the form
    this.seatMapForm = this.fb.group({
      seatType: ['', ],
      rowNo: ['', ],
      seatNo: ['',],
      seatPrice:[''],
      seatCode:[''],
      seatDescription:['']
    });

    this.seatMapForm?.get('seatCode')?.valueChanges.subscribe((selectedOption) => {
      this.seatMapForm?.get('seatDescription')?.setValue(
        this.ssrData?.SeatPreference.find(item => item.Code === selectedOption)?.Description
      );
      // Use selectedOption directly for the seatNo
    });
    
    
  }
  
  private extractPrice(selectedSeat: string): string {
    // Implement logic to extract the price from the selected seat option
    // For example, you can use regular expressions or string manipulation
    // For simplicity, let's assume the price is always in parentheses in the format (Rs. XXXX)
    const matches = selectedSeat.match(/\(Rs\. (\d+)\)/);
    return matches ? matches[1] : '';
  }

  emitSeatMapData() {
    // Emit the form data to the parent component
    this.seatMapData.emit(this.seatMapForm.value);
    this.closeDialog.emit()
  }

  close() {
    this.closeDialog.emit();
  }
}
