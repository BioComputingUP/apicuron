import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../auth/auth.guard';
import { AuthModule } from '../auth/auth.module';
import { DatabaseUpdateComponent } from './database-update/database-update.component';
import { SubmitReportComponent } from './submit-report/submit-report.component';
import { ManageTermsComponent } from './manage-terms/manage-terms.component';
import { DatabaseOverviewComponent } from 'src/app/dashboard-database/database-overview/database-overview.component';
import { UserDashboardComponent } from 'src/app/dashboard/user-dashboard/user-dashboard.component';
import { ManageBadgesComponent } from './manage-badges/manage-badges.component';
import { ManageMedalsComponent } from './manage-medals/manage-medals.component';

const databaseDashboardRoutes: Routes = [
  {
    path: ':resource_id',
    canActivate: [AuthGuard],
    component: UserDashboardComponent,
    children: [
      { path: '', component: DatabaseOverviewComponent, title:"Resource Overview" },
      { path: 'edit', component: DatabaseUpdateComponent, title:"Edit Resource" },
      { path: 'reports', component: SubmitReportComponent, title:"Manage Resource Reports" },
      { path: 'terms', component: ManageTermsComponent, title:"Manage Resource Terms" },
      { path: 'badges', component: ManageBadgesComponent, title:"Manage Resource Badges" },
      { path: 'medals', component: ManageMedalsComponent, title:"Manage Resource Medals" },
      { path: '**', redirectTo: '/', }, // redirects to the home page

    ]
  },
  
];

@NgModule({
  imports: [RouterModule.forChild(databaseDashboardRoutes), AuthModule],
  exports: [RouterModule]
})
export class DashboardDatabaseRoutingModule { }
