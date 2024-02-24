import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { HotelsService } from 'src/app/Services/hotels_api/hotels.service';

@Component({
  selector: 'app-payment-breakdown',
  templateUrl: './payment-breakdown.component.html',
  styleUrls: ['./payment-breakdown.component.scss']
})
export class PaymentBreakdownComponent implements OnInit {
  
  @Input() travelData:any;
  @Output() privacyDialogbox: EventEmitter<void> = new EventEmitter<void>();
  @Output() termsDialogBox: EventEmitter<void> = new EventEmitter<void>();
  @Output() refundDialogBox: EventEmitter<void> = new EventEmitter<void>();
  @Output() packageDailogBox: EventEmitter<void> = new EventEmitter<void>();
  arrowTermDirection = 'down';
  arrowDirection = 'down';
  arrowDateDirection = 'down';
  arrowExclusionDirection = 'down';
  taxesSectionExpanded: boolean = false;
  transactionFee:number;
  totalCost: number;
  merchantShare:number=0;
  initialCost: number;
  gst: any;
  constructor( private hotels:HotelsService) { }

  ngOnInit(): void {
    console.log(this.travelData)
    this.getData()
  }

  toggleTaxesSection() {
    this.taxesSectionExpanded = !this.taxesSectionExpanded;
  }

  package(){
    console.log('package')
    this.packageDailogBox.emit()
  }
  privacy(){
    console.log('privacy')

    this.privacyDialogbox.emit()
  }
  refundible(){
    console.log('refundible')
    this.refundDialogBox.emit()
  }
  terms(){
    console.log('terms')
    this.termsDialogBox.emit()
  }

  async getData() {
    console.log('fetching');
    
    try {
      const res = await this.hotels.getSearchInfo();
      console.log(res);
  
      if (res) {
        this.travelData = res;
        
        this.totalCost = this.travelData.cost.flightCost+this.travelData.cost.hotelCost+this.travelData.cost.taxes
        this.initialCost=this.totalCost;
        this.transactionFee=this.totalCost*0.0175;
        this.transactionFee = +this.transactionFee.toFixed(2);
        this.totalCost += this.transactionFee;
        this.totalCost = +this.totalCost.toFixed(2);

        
        console.log(this.travelData);
        
        
      } else {
        console.log("No data received from getSearchInfo");
      }
    } catch (error) {
      console.log(error);
    }
  }

  onMerchantShareChange() {
    console.log('Merchant Share changed:', this.merchantShare);
  
    const costChange = this.totalCost - this.initialCost;
    this.gst=this.merchantShare*0.18;
    this.gst = +this.gst.toFixed(2);
    this.totalCost = this.initialCost + this.merchantShare+this.gst;
    this.transactionFee = 0.0175 * this.totalCost;
  
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
}
