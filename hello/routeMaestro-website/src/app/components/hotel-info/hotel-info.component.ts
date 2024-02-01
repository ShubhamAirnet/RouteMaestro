import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-hotel-info',
  templateUrl: './hotel-info.component.html',
  styleUrls: ['./hotel-info.component.scss']
})
export class HotelInfoComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }
  
  isOpen = true;

  openModal() {
    this.isOpen = true;
  }

  closeModal() {
    this.isOpen = false;
  }


  scrollToSection(sectionId: string): void {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }
}
