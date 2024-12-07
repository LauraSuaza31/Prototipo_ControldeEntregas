import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from '../modules/dashboard/dashboard.component';
import { LayoutComponent } from './layout/layout.component';

const routes: Routes = [
	{
		path: 'dashboard', component: LayoutComponent,
		children: [
			{
				path: '', component: DashboardComponent, data: { titulo: 'Inicio' } 
			}
		]
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class SharedRoutingModule { }
