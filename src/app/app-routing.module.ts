import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './guard/auth.guard';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'home',
    canActivate: [AuthGuard],
    loadChildren: () => import('./home/home.module').then(m => m.HomePageModule)
  },
  {
    path: 'scheduled-departures',
    canActivate: [AuthGuard],
    loadChildren: () => import('./scheduled-departures/scheduled-departures.module').then(m => m.ScheduledDeparturesPageModule)
  },
  {
    path: 'exclusions',
    canActivate: [AuthGuard],
    loadChildren: () => import('./exclusions/exclusions.module').then(m => m.ExclusionsPageModule)
  },
  {
    path: 'setup',
    canActivate: [AuthGuard],
    loadChildren: () => import('./setup/setup.module').then(m => m.SetupPageModule)
  },
  {
    path: 'inside-assemble-modal',
    canActivate: [AuthGuard],
    loadChildren: () => import('./inside-assemble-modal/inside-assemble-modal.module').then(m => m.InsideAssembleModalPageModule)
  },
  {
    path: 'login',
    loadChildren: () => import('./login/login.module').then(m => m.LoginPageModule)
  },
  {
    path: 'register',
    loadChildren: () => import('./register/register.module').then(m => m.RegisterPageModule)
  },
  {
    path: 'forgot-password',
    loadChildren: () => import('./forgot-password/forgot-password.module').then(m => m.ForgotPasswordPageModule)
  },
  {
    path: 'change-password',
    loadChildren: () => import('./change-password/change-password.module').then( m => m.ChangePasswordPageModule)
  },
  {
    path: 'zones',
    loadChildren: () => import('./zones/zones.module').then( m => m.ZonesPageModule)
  },
  {
    path: 'memory',
    loadChildren: () => import('./memory/memory.module').then( m => m.MemoryPageModule)
  },
  {
    path: 'failures',
    loadChildren: () => import('./failures/failures.module').then( m => m.FailuresPageModule)
  },
  {
    path: 'instalator',
    loadChildren: () => import('./instalator/instalator.module').then( m => m.InstalatorPageModule)
  },
  {
    path: 'events',
    loadChildren: () => import('./events/events.module').then( m => m.EventsPageModule)
  },
  {
    path: 'users-labels',
    loadChildren: () => import('./users-labels/users-labels.module').then( m => m.UsersLabelsPageModule)
  },
  {
    path: 'clock',
    loadChildren: () => import('./clock/clock.module').then( m => m.ClockPageModule)
  },
  {
    path: 'battery',
    loadChildren: () => import('./battery/battery.module').then( m => m.BatteryPageModule)
  },
  {
    path: 'selector',
    loadChildren: () => import('./selector/selector.module').then( m => m.SelectorPageModule)
  },
  {
    path: 'contact-phone',
    loadChildren: () => import('./contact-phone/contact-phone.module').then( m => m.ContactPhonePageModule)
  },
  {
    path: 'custom-messages',
    loadChildren: () => import('./custom-messages/custom-messages.module').then( m => m.CustomMessagesPageModule)
  },
  {
    path: 'identification',
    loadChildren: () => import('./identification/identification.module').then( m => m.IdentificationPageModule)
  },
  {
    path: 'sms-password-change',
    loadChildren: () => import('./sms-password-change/sms-password-change.module').then( m => m.SmsPasswordChangePageModule)
  },
  {
    path: 'user-account',
    loadChildren: () => import('./user-account/user-account.module').then( m => m.UserAccountPageModule)
  }

];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
