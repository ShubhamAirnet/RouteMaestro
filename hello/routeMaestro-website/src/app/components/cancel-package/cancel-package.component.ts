

import { Component, OnInit } from '@angular/core';
import axios from 'axios'
import { PackageService } from 'src/app/Services/package/package.service';
import { hotel_details } from '../package-cancellation/hotel_details';
import { flightSegments } from './flightSegments';


@Component({
  selector: 'app-cancel-package',
  templateUrl: './cancel-package.component.html',
  styleUrls: ['./cancel-package.component.scss']
})
export class CancelPackageComponent implements OnInit {
  selectedRequestType: string = '';
  selectedCancellationType: string = '';
  selectedSectors: string[] = [];
  remarks: string = '';
  isPartial: boolean = false;
  travelData:any;
  hotelData=hotel_details;
  cities=[]


  sectors=[];
  sectorArray=[]
  cancelledHotels=[];
  hotelSet=[]

  constructor(private pack:PackageService) { }

  ngOnInit(): void {
    this.getData()
    console.log(this.cities)
    console.log(this.hotelData)
  }

  onRequestTypeChange() {
    this.isPartial = this.selectedRequestType === '2' ?true :false;
    console.log(this.isPartial)
  }

  updateHotelsArray(sector: any, isChecked: boolean) {
    const index = this.sectorArray.findIndex(s => s.Destination === sector.Destination && s.Origin === sector.Origin);
  
    if (index !== -1) {
      if (isChecked) {
        this.hotelSet.push(sector);
      } else {
        // Remove the sector from the array
        const hotelIndex = this.hotelSet.findIndex(s => s.hotelName === sector.hotelName && s.cityName === sector.cityName);
        if (hotelIndex !== -1) {
          this.hotelSet.splice(hotelIndex, 1);
        }
      }
    }
    console.log(this.hotelSet);
  }
  
  updateSectorArray(sector: any, isChecked: boolean) {
    if (isChecked) {
      this.sectorArray.push(sector);
      for (const hotelArray of Object.values(this.hotelData)) {
        if (hotelArray[0].cityName === sector.cityName) {
          this.cancelledHotels.push({ hotelName: hotelArray[0].search.HotelName, cityName: sector.cityName, Origin: sector.Origin, Destination: sector.Destination });
      
        }
      }
    } else {
      // Remove the sector from the array
      const index = this.sectorArray.findIndex(s => s.Destination === sector.Destination && s.Origin === sector.Origin);
      if (index !== -1) {
        this.sectorArray.splice(index, 1);
  
        for (const hotelArray of Object.values(this.hotelData)) {
          if (hotelArray[0].cityName === sector.cityName) {
            const cancelIndex = this.cancelledHotels.findIndex(s => s.hotelName === hotelArray[0].search.HotelName && s.cityName === sector.cityName);
            const hotelIndex = this.hotelSet.findIndex(s => s.hotelName === hotelArray[0].search.HotelName && s.cityName === sector.cityName);
            if (hotelIndex !== -1) {
              this.hotelSet.splice(hotelIndex, 1); // Remove from hotelSet
             
            }
            if(cancelIndex!== -1){
              this.cancelledHotels.splice(cancelIndex,1)
            }
          }
        }
      }
    }
    console.log(this.sectorArray);
    console.log(this.cancelledHotels);
    console.log(this.hotelSet);
  }
  
  

  
  

  onCancelClick() {
    console.log('Request Type:', this.selectedRequestType);
    console.log('Cancellation Type:', this.selectedCancellationType);

    console.log('Remarks:', this.remarks);

    if(this.isPartial){
      this.partialFlightCancellation()
      // this.partialHotelCancellation()

    }else{
      this.flightCancellation()
      // this.hotelCancellation()
    }
  }

  
  async hotelCancellation(){
    const payload={
      token:localStorage.getItem('authenticateToken'),
      requestType:this.selectedRequestType,
      remarks:this.remarks
    }
    console.log(payload)
    try{
      const {data}=await axios.post('http://localhost:4000/hotel/sendChangeRequest',payload);
      if(data){
        console.log(data)
      }
    }catch(error){
      console.log('something went wrong ',error.message)
    }
  }

  async partialHotelCancellation(){
    const payload={
      token:localStorage.getItem('authenticateToken'),
      requestType:this.selectedRequestType,
      remarks:this.remarks,
      cities:this.hotelSet
    }
    console.log(payload)
    try{
      const {data}=await axios.post('http://localhost:4000/hotel/getChangeRequest',payload);
      if(data){
        console.log(data)
      }
    }catch(error){
      console.log('something went wrong ',error.message)
    }

  }

  async flightCancellation(){
    const payload={
      flightToken:localStorage.getItem('authenticateToken'),
      requestType:this.selectedRequestType,
      remarks:this.remarks,
      cancellationType:this.selectedCancellationType
    }
    console.log(payload)
    try{
      const {data}=await axios.post('http://localhost:4000/flight/sendChangeRequest',payload);
      if(data){
        console.log(data)
      }
    }catch(error){
      console.log('something went wrong ',error.message)
    }
  }

  async partialFlightCancellation(){
    const payload={
      flightToken:localStorage.getItem('authenticateToken'),
      requestType:this.selectedRequestType,
      remarks:this.remarks,
      cancellationType:this.selectedCancellationType,
      sectors:this.sectorArray
    }
    console.log(payload)
    try{
      const {data}=await axios.post('http://localhost:4000/flight/sendChangeRequestPartial',payload);
      if(data){
        console.log(data)
      }
    }catch(error){
      console.log('something went wrong ',error.message)
    }

  }
 
  async getData(){
    try {
      const res = await this.pack.getAllData();
      console.log(res);
      if(res){
        this.travelData=flightSegments.segments;
        this.travelData.map((item)=>{
          item.map((sectors)=>{
            this.cities.push({Origin:sectors.Origin.Airport.AirportCode,Destination:sectors.Destination.Airport.AirportCode,cityName:sectors.Destination.Airport.CityName})
          })
        })
        // this.cities.push({cityCode:this.travelData.trip.departure_airport,cityName:this.travelData.trip.departureCity})
        // for(let item of this.travelData.cities){
        //   this.cities.push({cityCode:item.cityCode,cityName:item.cityName})
        // }
        // this.cities.push({cityCode:this.travelData.trip.departure_airport,cityName:this.travelData.trip.departureCity})
        console.log(this.cities)
        // this.sectorsArrange()
        this.sectors=this.cities
      }
    }catch(error){
      console.log(error.message)
    }
  }

  sectorsArrange(){
    for(let i=0;i<this.cities.length-1;i++){
      this.sectors.push({Origin:this.cities[i].cityCode,Destination:this.cities[i+1].cityCode,cityName:this.cities[i+1].cityName})
    }
    console.log(this.sectors)
  }
}
