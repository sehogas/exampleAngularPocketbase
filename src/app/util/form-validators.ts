import { AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms";

export function matchValidator(matchTo: string, reverse?: boolean): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (control.parent && reverse) {
        const c = (control.parent?.controls as any)[matchTo] as AbstractControl;
        if (c) {
          c.updateValueAndValidity();
        }
        return null;
      }
      return !!control.parent && !!control.parent.value && control.value === (control.parent?.controls as any)[matchTo].value ? null : { Matching: true };
    };
  }

export function patternValidator(regex: RegExp, error: ValidationErrors): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    if (!control.value) {
      // if control is empty return no error
      return null;
    }
    // test the value of the control against the regexp supplied
    const valid = regex.test(control.value);
    // if true, return no error (no error), else return error passed in the second parameter
    return valid ? null : error;
  };
}

export function notPatternValidator(regex: RegExp, error: ValidationErrors): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    if (!control.value) {
      // if control is empty return no error
      return null;
    }
    // test the value of the control against the regexp supplied
    const valid = !regex.test(control.value);
    // if true, return no error (no error), else return error passed in the second parameter
    return valid ? null : error;
  };
}
