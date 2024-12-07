import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './header/header.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { BreadcrumbsComponent } from './breadcrumbs/breadcrumbs.component';
import { FooterComponent } from './footer/footer.component';
import { LayoutComponent } from './layout/layout.component';
import { SharedRoutingModule } from './shared-routing.module';

@NgModule({
	declarations: [
		LayoutComponent,
		HeaderComponent,
		SidebarComponent,
		BreadcrumbsComponent,
		FooterComponent
	],
	imports: [
		CommonModule,
		SharedRoutingModule
	],
	exports: [
		LayoutComponent,
		HeaderComponent,
		SidebarComponent,
		BreadcrumbsComponent,
		FooterComponent
	]
})
export class SharedModule { }
