import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../auth/auth.guard';
import { AuthModule } from '../auth/auth.module';
import { DatabaseUpdateComponent } from './database-update/database-update.component';
import { DashboardComponent } from './dashboard.component';
import { SubmitReportComponent } from './submit-report/submit-report.component';
import { ManageTermsComponent } from './manage-terms/manage-terms.component';
import { ManageAchievementsComponent } from './manage-achievements/manage-achievements.component';

const routes: Routes = [
  {
    path: '',
    // pathMatch: 'full',
    component: DashboardComponent,
    canActivate: [AuthGuard],
    children: [
      { path: 'database/:resource_id/edit', component: DatabaseUpdateComponent },
      { path: 'database/:resource_id/reports', component: SubmitReportComponent },
      { path: 'database/:resource_id/terms', component: ManageTermsComponent },
      { path: 'database/:resource_id/achievements', component: ManageAchievementsComponent },
      { path: '**', redirectTo: '/', }, // redirects to the home page

    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes), AuthModule],
  exports: [RouterModule]
})
export class DashboardRoutingModule { }
