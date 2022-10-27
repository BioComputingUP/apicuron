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
  { path: 'database/:resource_id/edit', component: DatabaseUpdateComponent, canActivate:[AuthGuard] },
  { path: 'database/:resource_id/reports', component: SubmitReportComponent, canActivate: [AuthGuard] },
  { path: 'database/:resource_id/terms', component: ManageTermsComponent, canActivate: [AuthGuard] },
  { path: 'database/:resource_id/achievements', component: ManageAchievementsComponent, canActivate: [AuthGuard] }
];

@NgModule({
  imports: [RouterModule.forChild(routes), AuthModule],
  exports: [RouterModule]
})
export class DashboardRoutingModule { }
