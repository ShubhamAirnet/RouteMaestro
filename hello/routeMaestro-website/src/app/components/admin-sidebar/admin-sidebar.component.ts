import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-admin-sidebar',
  templateUrl: './admin-sidebar.component.html',
  styleUrls: ['./admin-sidebar.component.scss']
})
export class AdminSidebarComponent implements OnInit {
  isContainerExpanded: boolean = false;
  constructor() { }

  ngOnInit(): void {
    console.log('admin')
  }
  toggleExpanded() {
    this.isContainerExpanded = !this.isContainerExpanded;
}
} 

