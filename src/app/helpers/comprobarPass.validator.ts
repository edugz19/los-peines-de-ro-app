import { FormGroup, ValidationErrors, ValidatorFn } from '@angular/forms';

export const comprobarPass: ValidatorFn = (
  control: FormGroup
): ValidationErrors | null => {
  const pass = control.get('pass');
  const verificarPass = control.get('verificarPass');

  return pass.value === verificarPass.value ? null : { noSonIguales: true };
};
