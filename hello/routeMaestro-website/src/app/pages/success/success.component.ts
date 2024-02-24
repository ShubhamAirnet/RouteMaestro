import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TransactionsService } from 'src/app/Services/transactions.service';
import axios from 'axios';

@Component({
  selector: 'app-success',
  templateUrl: './success.component.html',
  styleUrls: ['./success.component.scss']
})
export class SuccessComponent implements OnInit {
  form:any | null=null;
  id:string='';
  @Input() resultIndex:any;
  @Input() traceId:any;
  @Input() isLCC:boolean;
  constructor(private route: ActivatedRoute,private transact:TransactionsService) { }

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id');
    console.log(this.id);
    this.getUserData(this.id)
    this.updateStatus(this.id)

    this.hotelBook()
    if(this.isLCC){
      this.ticketLCC()
    }else{
      this.flightBook()
    }
    

  }

  async hotelBook(){
    const payload={
      token:localStorage.getItem('authenticateToken')
    }
    try{
      const {data}=await axios.post('http://localhost:4000/hotel/hotelBook',payload);
      console.log(data)
    }catch(error){
      console.log('something went wrong',error.message)
    }
  }
  async flightBook(){
    const payload={
      flightToken:localStorage.getItem('authenticateToken'),
      traceId:this.traceId,
      reultIndex:this.resultIndex,
    }
    try{
      const {data}=await axios.post('http://localhost:4000/flight/flightBook',payload);
      if(data){
        console.log(data);
        this.ticketNonLCC()

      }
    }catch(error){
      console.log('something went wrong',error.message)
    }
  }

  async ticketLCC(){
    const payload={
      flightToken:localStorage.getItem('authenticateToken'),
      traceId:this.traceId,
      reultIndex:this.resultIndex,
    }
    try{
      const {data}=await axios.post('http://localhost:4000/flight/ticketLCC',payload);
      console.log(data);
    }catch(error){
      console.log('something went wrong ',error.message)
    }
  }
  async ticketNonLCC(){
    const payload={
      flightToken:localStorage.getItem('authenticateToken'),
      traceId:this.traceId,
    
    }
    try{
      const {data}=await axios.post('http://localhost:4000/flight/ticketNonLCC',payload);
      console.log(data);
    }catch(error){
      console.log('something went wrong ',error.message)
    }
  }
  
  async getUserData(id:string){
    const res=await this.transact.getUserDetails(id);
    console.log(res)
    this.form=res;


  }
  async updateStatus(id:string){
   try{
    const res=await this.transact.updateStatus(id);
    console.log('updated')
   }catch(error){
    console.log(error)
   }

  }

}
