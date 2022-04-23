import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { StripeSuccessPage } from './stripe-success.page';

const routes: Routes = [
  {
    path: '',
    component: StripeSuccessPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class StripeSuccessPageRoutingModule {}
