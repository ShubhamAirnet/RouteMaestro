import { Component, OnInit } from '@angular/core';
import { PackageService } from 'src/app/Services/package/package.service';

@Component({
  selector: 'app-package-list',
  templateUrl: './package-list.component.html',
  styleUrls: ['./package-list.component.scss']
})
export class PackageListComponent implements OnInit {
  packageData:any;
  status:number;

  constructor(private pack:PackageService) { }

  ngOnInit(): void {
    this.getData()
  }

  async getData(){
    try{
      const res=await this.pack.getAllData();
      if(res){
        this.packageData=res
        this.status = 0; // Default status

        this.packageData.hotelBookingDetails.forEach((item) => {
          const hotelStatus = item.data.BookResult.Status;
          const flightStatus = this.packageData.flight_details.booking_details.Status;

          if (flightStatus === 1) {
            if (hotelStatus === 1) {
              this.status = 1;
            } else if (hotelStatus === 0) {
              this.status = 0;
            }
          } else if (flightStatus === 2) {
            this.status = 0; // Set the status accordingly for flight status 2
          } else if (flightStatus === 6) {
            if (hotelStatus === 1) {
              this.status = 2;
            }
          }
        });

        console.log(res)
      }
    }catch(error){
      console.log(error)
    }


  }

}
