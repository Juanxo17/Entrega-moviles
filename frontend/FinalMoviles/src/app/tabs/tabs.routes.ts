import { Routes } from '@angular/router';
import { TabsPage } from './tabs.page';
import { adminGuard } from '../guards/admin.guard';

export const routes: Routes = [
  {
    path: '',
    component: TabsPage,
    children: [
      {
        path: 'tab1',
        loadComponent: () =>
          import('../tab1/tab1.page').then((m) => m.Tab1Page),
      },      {
        path: 'tab2',
        loadComponent: () =>
          import('../tab2/tab2.page').then((m) => m.Tab2Page),
      },
      {
        path: 'top-sites',
        loadComponent: () =>
          import('../pages/top-sites/top-sites.page').then((m) => m.TopSitesPage),
      },
      {
        path: 'tab3',
        loadComponent: () =>
          import('../tab3/tab3.page').then((m) => m.Tab3Page),
      },
      {
        path: 'favorites',
        loadComponent: () =>
          import('../pages/favorites/favorites.page').then((m) => m.FavoritesPage),
      },
      {
        path: 'tab4',
        loadComponent: () =>
          import('../pages/admin/admin.page').then((m) => m.AdminPage),
        canActivate: [adminGuard]
      },      // Admin pages
      {
        path: 'tab4/usuarios',
        loadComponent: () =>
          import('../pages/admin/admin-users.page').then((m) => m.AdminUsersPage),
        canActivate: [adminGuard]
      },
      {
        path: 'tab4/paises',
        loadComponent: () =>
          import('../pages/admin/admin-countries.page').then((m) => m.AdminCountriesPage),
        canActivate: [adminGuard]
      },      {
        path: 'tab4/ciudades',
        loadComponent: () =>
          import('../pages/admin/admin-cities.page').then((m) => m.AdminCitiesPage),
        canActivate: [adminGuard]
      },
      {
         path: 'tab4/famosos',
         loadComponent: () =>
           import('../pages/admin/admin-famous.page').then((m) => m.AdminFamousPage),
         canActivate: [adminGuard]
      },
      {
        path: 'tab4/sitios',
        loadComponent: () =>
          import('../pages/admin/admin-sites.page').then((m) => m.AdminSitesPage),
        canActivate: [adminGuard]
      },
      {
        path: 'tab4/platos',
        loadComponent: () =>
          import('../pages/admin/admin-dishes.page').then((m) => m.AdminDishesPage),
        canActivate: [adminGuard]
      },
      // City pages
      {
        path: 'ciudades/:id',
        loadComponent: () =>
          import('../pages/city/city-list.page').then((m) => m.CityListPage),
      },
      {
        path: 'ciudad/:id',
        loadComponent: () =>
          import('../pages/city/city-detail.page').then((m) => m.CityDetailPage),
      },
      // Site pages
      {
        path: 'sitios/:id',
        loadComponent: () =>
          import('../pages/site/site-list.page').then((m) => m.SiteListPage),
      },
      {
        path: 'sitio/:id',
        loadComponent: () =>
          import('../pages/site/site-detail.page').then((m) => m.SiteDetailPage),
      },      // Famous people pages - TEMPORARILY DISABLED
      {
         path: 'famosos/:id',
         loadComponent: () =>
           import('../pages/famous/famous-list.page').then((m) => m.FamousListPage),
       },
       {
         path: 'famoso/:id',
         loadComponent: () =>
           import('../pages/famous/famous-detail.page').then((m) => m.FamousDetailPage),
       },
      // Dish pages
      {
        path: 'platos/:id',
        loadComponent: () =>
          import('../pages/dish/dish-list.page').then((m) => m.DishListPage),
      },
      {
        path: 'plato/:id',
        loadComponent: () =>
          import('../pages/dish/dish-detail.page').then((m) => m.DishDetailPage),
      },
      {
        path: '',
        redirectTo: 'tab1',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: '',
    redirectTo: '/tabs/tab1',
    pathMatch: 'full',
  },
];
