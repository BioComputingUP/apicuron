import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../auth/auth.guard';
import { AuthModule } from '../auth/auth.module';
import { DatabaseUpdateComponent } from './database-update/database-update.component';
import { SubmitReportComponent } from './submit-report/submit-report.component';
import { ManageTermsComponent } from './manage-terms/manage-terms.component';
import { ManageAchievementsComponent } from './manage-achievements/manage-achievements.component';
import { DatabaseDashboardComponent } from './database-dashboard/database-dashboard.component';
import { UserDashboardComponent } from './user-dashboard/user-dashboard.component';
import { DatabaseOverviewComponent } from './database-overview/database-overview.component';

const routes: Routes = [
  {
    path: 'database/:resource_id',
    component: DatabaseDashboardComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', component: DatabaseOverviewComponent },
      { path: 'edit', component: DatabaseUpdateComponent },
      { path: 'reports', component: SubmitReportComponent },
      { path: 'terms', component: ManageTermsComponent },
      { path: 'achievements', component: ManageAchievementsComponent },
      { path: '**', redirectTo: '/', }, // redirects to the home page

    ]
  },
  {
    path: 'user',
    canActivate: [AuthGuard],
    component: UserDashboardComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes), AuthModule],
  exports: [RouterModule]
})
export class DashboardRoutingModule { }
