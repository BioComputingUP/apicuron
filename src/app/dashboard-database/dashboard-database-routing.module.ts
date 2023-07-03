import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../auth/auth.guard';
import { AuthModule } from '../auth/auth.module';
import { DatabaseUpdateComponent } from './database-update/database-update.component';
import { SubmitReportComponent } from './submit-report/submit-report.component';
import { ManageTermsComponent } from './manage-terms/manage-terms.component';
import { ManageAchievementsComponent } from './manage-achievements/manage-achievements.component';
import { DatabaseOverviewComponent } from 'src/app/dashboard-database/database-overview/database-overview.component';
import { UserDashboardComponent } from 'src/app/dashboard/user-dashboard/user-dashboard.component';

const routes: Routes = [
  {
    path: ':resource_id',
    canActivate: [AuthGuard],
    component: UserDashboardComponent,
    children: [
      { path: '', component: DatabaseOverviewComponent },
      { path: 'edit', component: DatabaseUpdateComponent },
      { path: 'reports', component: SubmitReportComponent },
      { path: 'terms', component: ManageTermsComponent },
      { path: 'achievements', component: ManageAchievementsComponent },
      { path: '**', redirectTo: '/', }, // redirects to the home page

    ]
  },
  
];

@NgModule({
  imports: [RouterModule.forChild(routes), AuthModule],
  exports: [RouterModule]
})
export class DashboardDatabaseRoutingModule { }
