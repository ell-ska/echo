import { Routes } from '@angular/router';

import { ExplorePageComponent } from './pages/explore.component';
import { SentPageComponent } from './pages/sent.component';
import { ReceivedPageComponent } from './pages/received.component';
import { CreateCapsulePageComponent } from './pages/create-capsule.component';
import { CapsulePageComponent } from './pages/capsule.component';
import { EditCapsulePageComponent } from './pages/edit-capsule.component';
import { ProfilePageComponent } from './pages/profile.component';
import { EditProfilePageComponent } from './pages/edit-profile.component';
import { CreateAccountPageComponent } from './pages/create-account.component';
import { PersonalizeAccountPageComponent } from './pages/personalize-account.component';
import { LogInPageComponent } from './pages/log-in.component';
import { NotFoundPageComponent } from './pages/not-found.component';
import { MainLayoutComponent } from './layouts/main.component';
import { CreateCapsuleLayoutComponent } from './layouts/create-capsule.component';

export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      { path: '', component: ExplorePageComponent },
      { path: 'sent', component: SentPageComponent },
      { path: 'received', component: ReceivedPageComponent },
      { path: 'capsule/:id', component: CapsulePageComponent },
    ],
  },
  {
    path: '',
    component: CreateCapsuleLayoutComponent,
    children: [
      { path: 'capsule/create', component: CreateCapsulePageComponent },
    ],
  },
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      { path: 'capsule/:id/edit', component: EditCapsulePageComponent },
      { path: 'profile', component: ProfilePageComponent },
      { path: 'profile/edit', component: EditProfilePageComponent },
    ],
  },
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      { path: 'create-account', component: CreateAccountPageComponent },
      {
        path: 'personalize-account',
        component: PersonalizeAccountPageComponent,
      },
      { path: 'log-in', component: LogInPageComponent },
    ],
  },
  {
    path: '**',
    component: MainLayoutComponent,
    children: [{ path: '', component: NotFoundPageComponent }],
  },
];
