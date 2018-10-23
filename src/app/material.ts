import { NgModule } from '@angular/core'
import { MatInputModule, MatNativeDateModule } from '@angular/material'
import { MatAutocompleteModule } from '@angular/material/autocomplete'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatDatepickerModule } from '@angular/material/datepicker'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
import { MatSelectModule } from '@angular/material/select';

const modules = [MatInputModule, MatNativeDateModule, MatAutocompleteModule,
  MatFormFieldModule, MatDatepickerModule, MatProgressSpinnerModule, MatSelectModule
]
@NgModule({
  imports: modules,
  exports: modules
})
export class MaterialModule { }