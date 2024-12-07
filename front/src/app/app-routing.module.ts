import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { NoPageFoundComponent } from './no-page-found/no-page-found.component';
import { LoginComponent } from './auth/login/login.component';
import { GeneralModule } from './modules/general/general.module';
import { ConfigurationModule } from '../app/modules/configuration/configuration.module';
import { SharedModule } from './shared/shared.module';

const routes: Routes = [
	{
		path: '', component: LoginComponent, 
		loadChildren: () => import('../app/auth/auth.module').then(m => m.AuthModule)
	},
    { 
		path: 'dashboard',
		loadChildren: () => import('./shared/shared.module').then(m => m.SharedModule)
	},
    {
		path: 'general',
		loadChildren: () => import('../app/modules/general/general.module').then(m => m.GeneralModule)
	},
	{
		path: 'configuration',
		loadChildren: () => import('../app/modules/configuration/configuration.module').then(m => m.ConfigurationModule)
	},
    { path: '**', component: NoPageFoundComponent }
];

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forRoot(routes),
		SharedModule,
        GeneralModule,
        ConfigurationModule
    ],
    exports: [
        RouterModule
    ]
})
export class AppRoutingModule { }
