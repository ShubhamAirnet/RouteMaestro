import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TransactionsService } from 'src/app/Services/transactions.service';

@Component({
  selector: 'app-success',
  templateUrl: './success.component.html',
  styleUrls: ['./success.component.scss']
})
export class SuccessComponent implements OnInit {
  form:any | null=null;
  id:string=''
  constructor(private route: ActivatedRoute,private transact:TransactionsService) { }

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id');
    console.log(this.id);
    this.getUserData(this.id)
    this.updateStatus(this.id)

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
