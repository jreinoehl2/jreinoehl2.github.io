// Calendar implementation for date picking

class Calendar {
  constructor() {
      this.currentMonth = new Date();
      this.selectedDate = new Date();
      this.calendarContainer = document.getElementById('calendar-container');
      this.calendarToggle = document.getElementById('calendar-toggle');
      this.onDateSelected = null;
      
      // Initialize the toggle button
      this.calendarToggle.addEventListener('click', () => this.toggleCalendar());
      
      // Close calendar when clicking outside
      document.addEventListener('click', (e) => {
          if (!this.calendarContainer.contains(e.target) && 
              e.target !== this.calendarToggle && 
              this.calendarContainer.classList.contains('active')) {
              this.toggleCalendar();
          }
      });
  }
  
  toggleCalendar() {
      if (this.calendarContainer.classList.contains('active')) {
          this.calendarContainer.classList.remove('active');
      } else {
          this.renderCalendar();
          this.calendarContainer.classList.add('active');
      }
  }
  
  renderCalendar() {
      const year = this.currentMonth.getFullYear();
      const month = this.currentMonth.getMonth();
      
      // Get first day of month and last day
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      
      // Get day of week for first day (0 = Sunday)
      const firstDayOfWeek = firstDay.getDay();
      
      // Calendar HTML structure
      let calendarHTML = `
          <div class="calendar-header">
              <div class="calendar-title">${this.currentMonth.toLocaleString('default', { month: 'long' })} ${year}</div>
              <div class="calendar-controls">
                  <button class="prev-month">&lt;</button>
                  <button class="next-month">&gt;</button>
              </div>
          </div>
          <div class="calendar-grid">
              <div class="calendar-day-header">Sun</div>
              <div class="calendar-day-header">Mon</div>
              <div class="calendar-day-header">Tue</div>
              <div class="calendar-day-header">Wed</div>
              <div class="calendar-day-header">Thu</div>
              <div class="calendar-day-header">Fri</div>
              <div class="calendar-day-header">Sat</div>
      `;
      
      // Previous month's days
      const prevLastDay = new Date(year, month, 0).getDate();
      for (let i = firstDayOfWeek - 1; i >= 0; i--) {
          const day = prevLastDay - i;
          calendarHTML += `<div class="calendar-day other-month" data-date="${year}-${month === 0 ? 12 : month}-${day}">${day}</div>`;
      }
      
      // Current month's days
      const today = new Date();
      for (let i = 1; i <= lastDay.getDate(); i++) {
          const date = new Date(year, month, i);
          const isSelected = this.isSameDay(date, this.selectedDate);
          const isToday = this.isSameDay(date, today);
          
          calendarHTML += `
              <div class="calendar-day ${isSelected ? 'selected' : ''} ${isToday ? 'today' : ''}" 
                   data-date="${year}-${month+1}-${i}">
                  ${i}
              </div>
          `;
      }
      
      // Next month's days
      const daysFromNextMonth = 42 - (firstDayOfWeek + lastDay.getDate());
      for (let i = 1; i <= daysFromNextMonth; i++) {
          calendarHTML += `<div class="calendar-day other-month" data-date="${year}-${month+2}-${i}">${i}</div>`;
      }
      
      calendarHTML += `
          </div>
          <div class="calendar-footer">
              <button class="today-button">Today</button>
          </div>
      `;
      
      this.calendarContainer.innerHTML = calendarHTML;
      
      // Add event listeners
      this.calendarContainer.querySelector('.prev-month').addEventListener('click', (e) => {
        e.stopPropagation(); // Stop event from bubbling up
        this.changeMonth(-1);
      });
      
      this.calendarContainer.querySelector('.next-month').addEventListener('click', (e) => {
          e.stopPropagation(); // Stop event from bubbling up
          this.changeMonth(1);
      });
      
      this.calendarContainer.querySelector('.today-button').addEventListener('click', (e) => {
          e.stopPropagation(); // Stop event from bubbling up
          this.goToToday();
      });
      
      // Add event listeners for day selection
      const days = this.calendarContainer.querySelectorAll('.calendar-day:not(.other-month)');
      days.forEach(day => {
          day.addEventListener('click', (e) => this.selectDay(e));
      });
  }
  
  changeMonth(delta) {
      this.currentMonth.setMonth(this.currentMonth.getMonth() + delta);
      this.renderCalendar();
  }
  
  goToToday() {
      this.currentMonth = new Date();
      this.selectedDate = new Date();
      this.renderCalendar();
      if (this.onDateSelected) {
          this.onDateSelected(this.selectedDate);
      }
      this.toggleCalendar();
  }
  
  selectDay(event) {
      const dateStr = event.target.dataset.date;
      const [year, month, day] = dateStr.split('-').map(num => parseInt(num));
      
      // JavaScript months are 0-based, but we store them as 1-based in the data attribute
      this.selectedDate = new Date(year, month-1, day);
      
      if (this.onDateSelected) {
          this.onDateSelected(this.selectedDate);
      }
      
      this.toggleCalendar();
  }
  
  isSameDay(date1, date2) {
      return date1.getDate() === date2.getDate() && 
             date1.getMonth() === date2.getMonth() && 
             date1.getFullYear() === date2.getFullYear();
  }
  
  setOnDateSelected(callback) {
      this.onDateSelected = callback;
  }
}