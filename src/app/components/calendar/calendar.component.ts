import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CalendarOptions } from '@fullcalendar/core'; // useful for typechecking
import dayGridPlugin from '@fullcalendar/daygrid';
import { FullCalendarModule } from '@fullcalendar/angular';
import interactionPlugin, { DateClickArg } from '@fullcalendar/interaction';
import { AuthService } from '../../services/auth.service';
import { BandService } from '../../services/band.service';


@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [
    FullCalendarModule,
    RouterLink
  ],
  templateUrl: './calendar.component.html',
  styleUrl: './calendar.component.css'
})
export class CalendarComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly bandService = inject(BandService);
  private readonly router = inject(Router);
  protected readonly calendarOptions: CalendarOptions = {
    initialView: 'dayGridMonth',
    plugins: [dayGridPlugin, interactionPlugin],
    eventClick: (arg) => {
      const calendarEvent = this.calendarEventsInfo.find(value => 
        value.title === arg.event.title && 
        arg.event.start!.toISOString().startsWith(value.date.toString())
      );
      this.router.navigateByUrl(`/dashboard/bandas/${calendarEvent!.bandId}/eventos/${calendarEvent!.eventId}`);
    },
    eventMouseEnter: function(info) {
      info.el.style.cursor = 'pointer';
    },
  };
  private calendarEventsInfo : {title: string; date: Date; bandId: number; eventId: string}[] = [];

  ngOnInit(): void {
    this.authService
        .getAuthenticatedUserRole()
        .subscribe({
          next: (userRole) => {
            this.bandService
                .listBandsByMemberUserNickname(userRole.nickname)
                .subscribe({
                  next: (bands) => {
                    this.calendarEventsInfo = bands.flatMap(band => {
                        return band?.events!.map(event => {return {
                          title: event.description,
                          date: event.date,
                          bandId: band.bandId,
                          eventId: event.eventId!
                        }})
                      }
                    );
                    this.calendarOptions['events'] = this.calendarEventsInfo.map(value => {
                      return {
                        title: value.title,
                        date: value.date
                      };
                    });
                  },
                  error: (err) => console.error(err)
                });
          },
          error: (err) => console.error(err)
        });
    
  }

  private handleDateClick(arg : DateClickArg) {
    alert('date click! ' + arg.dateStr)
  }
}
