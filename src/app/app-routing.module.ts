import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NotFoundComponent } from './views/not-found/not-found.component';
import { HomeComponent } from './views/home/home.component';
import { InactiveAuthGuardService } from './views/shared/guards/inactive-auth-guard.service';
import { LoginComponent } from './views/identity/login/login.component';
import { ActiveAuthGuardService } from './views/shared/guards/active-auth-guard.service';
import { SignupComponent } from './views/identity/signup/signup.component';
import { ForgotPasswordComponent } from './views/identity/forgot-password/forgot-password.component';
import { ActionComponent } from './views/identity/action/action.component';
import { SubscriptionGuard } from './views/shared/guards/subscription.guard';

const routes: Routes = [
	{ path: '', redirectTo: 'home', pathMatch: 'full' },
	{ path: 'home', component: HomeComponent, canActivate: [InactiveAuthGuardService, SubscriptionGuard], data: { title: 'Home' } },
	{ path: 'identity/signup', component: SignupComponent, pathMatch: 'full', canActivate: [ActiveAuthGuardService], data: { title: 'Signup' } },
	{ path: 'identity/signup/:ig', component: SignupComponent, pathMatch: 'full', canActivate: [ActiveAuthGuardService], data: { title: 'Signup' } },
	{ path: 'identity/login', component: LoginComponent, pathMatch: 'full', canActivate: [ActiveAuthGuardService], data: { title: 'Login' } },
	{ path: 'identity/forgot-password', component: ForgotPasswordComponent, pathMatch: 'full', canActivate: [ActiveAuthGuardService], data: { title: 'Forgot Password' } },
	{ path: 'identity/action', component: ActionComponent, pathMatch: 'full', data: { title: 'Action' } },
	{ path: '**', component: NotFoundComponent, data: { title: 'Not Found' } }
];

@NgModule({
	imports: [RouterModule.forRoot(routes)],
	exports: [RouterModule]
})
export class AppRoutingModule { }
