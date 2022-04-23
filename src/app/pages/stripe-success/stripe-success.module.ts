import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { StripeSuccessPageRoutingModule } from './stripe-success-routing.module';

import { StripeSuccessPage } from './stripe-success.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    StripeSuccessPageRoutingModule
  ],
  declarations: [StripeSuccessPage]
})
export class StripeSuccessPageModule {}
