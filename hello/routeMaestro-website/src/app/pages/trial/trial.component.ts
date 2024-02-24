// trial.component.ts
import { Component, OnInit } from '@angular/core';
import { NgbDateStruct, NgbDatepickerConfig } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-trial',
  templateUrl: './trial.component.html',
  styleUrls: ['./trial.component.scss']
})
export class TrialComponent implements OnInit {

  selectedDate: Date;
  selectedDay: string | number = 'DD';
selectedMonth: string | number = 'MM';
selectedYear: string | number = 'YYYY';
  // Add any other necessary properties
  // In your component.ts
daysInMonthArray: (number | string)[] = ['DD', ...Array.from({ length: 31 }, (_, i) => i + 1)];
monthsArray: (string | number)[] = ['MM', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
yearsArray: (number | string)[] = ['YYYY', ...Array.from({ length: new Date().getFullYear() - 1900 + 10 }, (_, i) => 1900 + i)];


  constructor(config: NgbDatepickerConfig) {
    
  
  }

  ngOnInit(): void {
    console.log('trial');
    this.selectedDate = new Date();
  }
  onDateChange() {
    console.log('Selected Date:', this.selectedDay, this.monthsArray[this.selectedMonth], this.selectedYear);
  }
  getWeeks(date: Date) {
    const weeks = [];
    const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    const firstDayOfWeek = firstDayOfMonth.getDay();
  
    // Add empty days before the first day of the month
    for (let i = 0; i < firstDayOfWeek; i++) {
      weeks.push([]);
    }
  
    // Add days to the weeks
    const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    for (let i = 1; i <= daysInMonth; i++) {
      const day = new Date(date.getFullYear(), date.getMonth(), i);
      const weekIndex = Math.floor((day.getDate() - 1 + firstDayOfWeek) / 7);
      weeks[weekIndex].push(day);
    }
  
    return weeks;
  }
  
  onPrevMonth() {
    this.selectedDate = new Date(this.selectedDate.getFullYear(), this.selectedDate.getMonth() - 1, 1);
  }
  
  onNextMonth() {
    this.selectedDate = new Date(this.selectedDate.getFullYear(), this.selectedDate.getMonth() + 1, 1);
  }
  

  onDateSelection(date: Date) {
    this.selectedDate=date
  }
}
