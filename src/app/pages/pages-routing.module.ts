import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";

import { CalendarComponent } from "./calendar/calendar.component";

const routes: Routes = [
  /* { path: "", redirectTo: "dashboard" },

  { path: "dashboard", component: DefaultComponent }, */
  { path: "calendar", component: CalendarComponent },
  {
    path: "dashboards",
    loadChildren: () =>
      import("./dashboards/dashboards.module").then((m) => m.DashboardsModule),
  },
  {
    path: "ecommerce",
    loadChildren: () =>
      import("./ecommerce/ecommerce.module").then((m) => m.EcommerceModule),
  },

  {
    path: "projects",
    loadChildren: () =>
      import("./projects/projects.module").then((m) => m.ProjectsModule),
  },
  {
    path: "tasks",
    loadChildren: () =>
      import("./tasks/tasks.module").then((m) => m.TasksModule),
  },

  {
    path: "pages",
    loadChildren: () =>
      import("./utility/utility.module").then((m) => m.UtilityModule),
  },
  {
    path: "ui",
    loadChildren: () => import("./ui/ui.module").then((m) => m.UiModule),
  },
  {
    path: "form",
    loadChildren: () => import("./form/form.module").then((m) => m.FormModule),
  },
  {
    path: "tables",
    loadChildren: () =>
      import("./tables/tables.module").then((m) => m.TablesModule),
  },
  {
    path: "icons",
    loadChildren: () =>
      import("./icons/icons.module").then((m) => m.IconsModule),
  },
  {
    path: "charts",
    loadChildren: () =>
      import("./chart/chart.module").then((m) => m.ChartModule),
  },
  {
    path: "maps",
    loadChildren: () => import("./maps/maps.module").then((m) => m.MapsModule),
  },
  {
    path: "seguridad",
    loadChildren: () =>
      import("./mangment-user/mangment-user.module").then(
        (m) => m.MangmentUserModule
      ),
  },
  {
    path: "referencia",
    loadChildren: () =>
      import("./projection/projection.module").then((m) => m.ProjectionModule),
  },
  {
    path: "procesos",
    loadChildren: () =>
      import("./process/process.module").then((m) => m.ProcessModule),
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PagesRoutingModule {}
