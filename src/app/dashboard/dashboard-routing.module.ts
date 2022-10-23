import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../auth/auth.guard';
import { AuthModule } from '../auth/auth.module';
import { DatabaseUpdateComponent } from './database-update/database-update.component';
import { DashboardComponent } from './dashboard.component';
import { SubmitReportComponent } from './submit-report/submit-report.component';

const routes: Routes = [
  { path: 'database/:resource_id/edit', component: DatabaseUpdateComponent, canActivate:[AuthGuard] },
  { path: 'database/:resource_id/reports', component: SubmitReportComponent, canActivate: [AuthGuard] }
];

@NgModule({
  imports: [RouterModule.forChild(routes), AuthModule],
  exports: [RouterModule]
})
export class DashboardRoutingModule { }
