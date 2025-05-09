import { Routes } from '@angular/router';

import { ExplorePageComponent } from './pages/explore.component';
import { SentPageComponent } from './pages/sent.component';
import { ReceivedPageComponent } from './pages/received.component';
import { CapsulePageComponent } from './pages/capsule.component';
import { ProfilePageComponent } from './pages/profile.component';
import { EditProfilePageComponent } from './pages/edit-profile.component';
import { CreateAccountPageComponent } from './pages/create-account.component';
import { PersonalizeAccountPageComponent } from './pages/personalize-account.component';
import { LogInPageComponent } from './pages/log-in.component';
import { NotFoundPageComponent } from './pages/not-found.component';
import { MainLayoutComponent } from './layouts/main.component';
import { CapsuleEditorLayoutComponent } from './layouts/capsule-editor.component';
import { ContentComponent } from './pages/capsule-wizard/content.component';
import { VisibilityComponent } from './pages/capsule-wizard/visibility.component';
import { ReceiversComponent } from './pages/capsule-wizard/receivers.component';
import { OpenDateComponent } from './pages/capsule-wizard/open-date.component';

const wizardRoutes: Routes = [
  { path: 'content', component: ContentComponent },
  { path: 'visibility', component: VisibilityComponent },
  { path: 'receivers', component: ReceiversComponent },
  { path: 'open-date', component: OpenDateComponent },
  { path: '', redirectTo: 'content', pathMatch: 'full' },
];

export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      { path: '', component: ExplorePageComponent },
      { path: 'sent', component: SentPageComponent },
      { path: 'received', component: ReceivedPageComponent },
    ],
  },
  {
    path: '',
    component: CapsuleEditorLayoutComponent,
    children: [
      {
        path: 'capsule/create',
        children: wizardRoutes,
      },
      {
        path: 'capsule/:id/edit',
        children: wizardRoutes,
      },
    ],
  },
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      { path: 'capsule/:id', component: CapsulePageComponent },
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
