import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NotFoundComponent } from './views/not-found/not-found.component';
import { HomeComponent } from './views/home/home.component';
import { BasePageDirective } from './views/shared/base-page.directive';
import { LoginComponent } from './views/identity/login/login.component';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { environment } from 'src/environments/environment';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { SignupComponent } from './views/identity/signup/signup.component';
import { ForgotPasswordComponent } from './views/identity/forgot-password/forgot-password.component';
import { ActionComponent } from './views/identity/action/action.component';
import { BlockUIModule } from 'ng-block-ui';
// import { RECAPTCHA_V3_SITE_KEY, RecaptchaV3Module } from 'ng-recaptcha';
import { AuthService } from './domain/auth/services/auth.service';
import { AuthInterceptor } from './domain/auth/interceptors/auth.interceptor';
import { BookmarkTreeComponent } from './views/partials/bookmark-tree/bookmark-tree.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { ErrorStateMatcher, MatRippleModule, ShowOnDirtyErrorStateMatcher } from '@angular/material/core';
import { MatCardModule } from '@angular/material/card';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatDividerModule } from '@angular/material/divider';
import { MatMenuModule } from '@angular/material/menu';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { DirectoryMenuComponent } from './views/partials/directory-menu/directory-menu.component';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { MatDialogModule } from '@angular/material/dialog';
import { DialogDeleteCollectionComponent } from './views/dialogs/dialog-delete-collection/dialog-delete-collection.component';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MarkdownModule } from 'ngx-markdown';

@NgModule({
	declarations: [
		AppComponent,
		NotFoundComponent,
		HomeComponent,
		BasePageDirective,
		LoginComponent,
		SignupComponent,
		ForgotPasswordComponent,
		ActionComponent,
		BookmarkTreeComponent,
		DirectoryMenuComponent,
		DialogDeleteCollectionComponent
	],
	imports: [
		BrowserModule,
		AppRoutingModule,
		FormsModule,
		ReactiveFormsModule,
		HttpClientModule,
		provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),
		provideAuth(() => getAuth()),
		BlockUIModule.forRoot(),
		BrowserAnimationsModule,
		DragDropModule,
		MatToolbarModule,
		MatIconModule,
		MatButtonModule,
		MatSnackBarModule,
		MatRippleModule,
		MatCardModule,
		MatGridListModule,
		MatDividerModule,
		MatMenuModule,
		MatInputModule,
		MatListModule,
		MatBottomSheetModule,
		MatDialogModule,
		MatSidenavModule,
		MarkdownModule.forRoot()
	],
	providers: [
		AuthService,
		{
			provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true
		},
		{
			provide: ErrorStateMatcher, useClass: ShowOnDirtyErrorStateMatcher
		}
	],
	bootstrap: [AppComponent]
})
export class AppModule { }
