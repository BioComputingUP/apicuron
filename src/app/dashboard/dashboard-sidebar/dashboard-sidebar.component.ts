import { Component, Input, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'dashboard-sidebar',
  templateUrl: './dashboard-sidebar.component.html',
  styleUrls: ['./dashboard-sidebar.component.scss']
})
export class DashboardSidebarComponent implements OnInit {
  links$: Observable<{ href: any[]; name: string; }[]>;

  constructor() { }

  @Input('resource') resource$: Observable<any>;
  mobile_toggle = false;

  minimized = false;

  logo_src(logo: string){
    if(logo.startsWith('assets')){
      return logo
    }else{
      return new URL(logo, environment.ws + '/');
    }
  }

  ngOnInit(): void {

    this.links$ = this.resource$.pipe(
      map(({ resource_name, resource_id}) => {

        return [
          {
            href: ['/dashboard', 'database', resource_id],
            name: `Overview`,
            icon: 'assets/svg/overview.svg'
          },
          {
            href: ['/dashboard', 'database', resource_id, 'edit'],
            name: `Edit ${resource_name}`,
            icon: 'assets/svg/pencil.svg'
          },
          {
            href: ['/dashboard', 'database', resource_id, 'terms'],
            name: `Manage ${resource_name} Terms`,
            icon: 'assets/svg/settings.svg'
          },
          {
            href: ['/dashboard', 'database', resource_id, 'reports'],
            name: 'Submit Reports',
            icon: 'assets/svg/document-text.svg'
          },
          {
            href: ['/dashboard', 'database', resource_id, 'achievements'],
            name: 'Manage Achievements',
            icon: 'assets/medal_icon.svg'

          }
        ]

      })
    )
  }

}
