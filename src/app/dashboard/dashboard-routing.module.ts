import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../auth/auth.guard';
import { AuthModule } from '../auth/auth.module';
import { UserDashboardComponent } from './user-dashboard/user-dashboard.component';
import { UserOverviewComponent } from 'src/app/dashboard/user-overview/user-overview.component';

const routes: Routes = [
  {
    path: '',
    canActivate: [AuthGuard],
    component: UserDashboardComponent,
    children: [
      { path: '', component: UserOverviewComponent },
      // { path: 'edit', component: DatabaseUpdateComponent },
      // { path: 'reports', component: SubmitReportComponent },
      // { path: 'terms', component: ManageTermsComponent },
      // { path: 'achievements', component: ManageAchievementsComponent },
      // { path: '**', redirectTo: '/', }, // redirects to the home page
    ]
  },
  { path: 'database', loadChildren: () => import('../dashboard-database/dashboard-database.module').then(m => m.DashboardDatabaseModule) },

  // {
  //   path: 'database/:resource_id',
  //   component: UserDashboardComponent,
  //   canActivate: [AuthGuard],
  //   children: [
  //     { path: '', component: DatabaseOverviewComponent },
  //     { path: 'edit', component: DatabaseUpdateComponent },
  //     { path: 'reports', component: SubmitReportComponent },
  //     { path: 'terms', component: ManageTermsComponent },
  //     { path: 'achievements', component: ManageAchievementsComponent },
  //     { path: '**', redirectTo: '/', }, // redirects to the home page

  //   ]
  // },
  
];

@NgModule({
  imports: [RouterModule.forChild(routes), AuthModule],
  exports: [RouterModule]
})
export class DashboardRoutingModule { }
