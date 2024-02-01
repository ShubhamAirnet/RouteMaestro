import { Component, OnInit } from '@angular/core';
import axios from 'axios'
import { HotelsService } from 'src/app/Services/hotels_api/hotels.service';
@Component({
  selector: 'app-hotel-cards',
  templateUrl: './hotel-cards.component.html',
  styleUrls: ['./hotel-cards.component.scss']
})
export class HotelCardsComponent implements OnInit {
  hotelSearchData = [] as any[];
  hotelInfoData = [] as any[];
  hotelRoomInfoData = [] as any[];
  traceId:string;
  tokenId:string="5951cd4a-c89c-4a8d-80d6-b3954cad2c77";
  data:any;
  showCancellationTooltip:boolean = false;
  travelData:any;
  NoOfRooms:number;
  resultCount:number=10;
  dialog:boolean=true;
  hotels:any;

  RoomGuests= [] as any[];
 

  constructor(private auth:HotelsService) {
    this.getAllDetails()
    
    
   }

   async getAllDetails(){
    try{
      const res=await axios.post('http://localhost:4000/hotel/getIternary',{resultCount:this.resultCount})
      console.log(res.data)
      this.hotels=res.data.data;
      
    }catch(error){
      console.log(error)
    }

   }
  ngOnInit(): void {
    // this.getData()
    
  }
  getStarArray(rating: number): any[] {
    return Array(rating).fill(0);
  }

  async getData() {
    console.log('fetching');
    
    try {
      const res = await this.auth.getSearchInfo();
      console.log(res);
      this.hotelSearchData=[]
  
      if (res) {
        this.travelData = res;
        console.log(res)
        this.NoOfRooms = this.travelData.trip.RoomGuests.length;
        
       
    
        // Create an array of promises for each city's hotel search data
        const hotelSearchDataPromises = this.travelData.cities.map(city => this.getHotelSearchData(city));
  
        // Use Promise.all to wait for all promises to resolve
        await Promise.all([...hotelSearchDataPromises]);
  
        
    
        console.log(this.NoOfRooms);
        console.log(this.travelData);
        console.log(this.hotelSearchData); // Now hotelSearchData is an array
        this.getAllData(this.hotelSearchData)
      } else {
        console.log("No data received from getSearchInfo");
      }
    } catch (error) {
      console.log(error);
    }
  }
  
  async getHotelSearchData(city) {
    try {
      const { data } = await axios.post('http://localhost:4000/hotel/hotelSearch', {
        tokenId: this.tokenId,
        checkInDate: city.checkInDate,
        noOfNights: city.noOfNights,
        cityId: city.cityId,
        countryCode: city.countryCode,
        noOfRooms: this.NoOfRooms,
        RoomGuests: this.travelData.trip.RoomGuests,
        resultCount:this.resultCount,
      });
  
      console.log(data);
  
      const hotelSearchData = data.data.HotelSearchResult;
      hotelSearchData.CityName = city.cityName;
  
      console.log(hotelSearchData);
      console.log(hotelSearchData.TraceId);
  
      // Return hotelSearchData as an array
      this.hotelSearchData.push(hotelSearchData);
    } catch (error) {
      console.log(error);
      // Return an empty array or handle the error as needed
      return [];
    }
  }
  
  
  async getAllData(hotelSearchData: any[]) {
    // Arrays to store promises for hotel info and room info calls
    let hotelInfoPromises = [];
    let hotelRoomInfoPromises = [];
  
    // Iterate through each hotelSearchData item
    for (const data of hotelSearchData) {
      // Call getHotelInfoData for each hotel
       hotelInfoPromises = data.HotelResults.map(item => this.getHotelInfoData(item.ResultIndex, item.HotelCode,data.TraceId));
       hotelRoomInfoPromises = data.HotelResults.map(item => this.getHotelRoomInfoData(item.ResultIndex, item.HotelCode,data.TraceId));
       
       // Wait for all promises to resolve using Promise.all
      await Promise.all([...hotelInfoPromises, ...hotelRoomInfoPromises]);
      this.hotelInfoData.push(hotelInfoPromises)
      this.hotelRoomInfoData.push(hotelRoomInfoPromises)
    }
  
    
  
    // Now both hotelInfoData and hotelRoomInfoData arrays are populated
    console.log('All data fetched:', this.hotelInfoData, this.hotelRoomInfoData);
  }
  
  
  async getHotelInfoData(resultIndex:Number,hotelCode:string,traceId:string){
    const payload={resultIndex,hotelCode,traceId:traceId,tokenId:this.tokenId}
    try{
      const {data}=await axios.post('http://localhost:4000/hotel/hotelInfo',payload);
      return data;

    }catch(error){
      console.log(error)
    }
  }
  async getHotelRoomInfoData(resultIndex:Number,hotelCode:string,traceId:string){
    const payload={resultIndex,hotelCode,traceId,tokenId:this.tokenId}
    try{
      const {data}=await axios.post('http://localhost:4000/hotel/hotelRoomInfo',payload);
      return data;

    }catch(error){
      console.log(error)
    }
  }

  loadMoreData(){
    this.resultCount+=10;
    this.getAllDetails();
  }

  close(){
    this.dialog=!this.dialog;
  }
}
