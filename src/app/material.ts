import { NgModule } from '@angular/core'
import {MatInputModule, MatNativeDateModule} from '@angular/material'
import {MatAutocompleteModule} from '@angular/material/autocomplete'
import {MatFormFieldModule} from '@angular/material/form-field'
import {MatDatepickerModule} from '@angular/material/datepicker'
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner'

const modules = [MatInputModule, MatNativeDateModule, MatAutocompleteModule,
  MatFormFieldModule, MatDatepickerModule, MatProgressSpinnerModule
]
@NgModule({
  imports: modules,
  exports: modules
})
export class MaterialModule { }