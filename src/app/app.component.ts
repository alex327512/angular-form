import { Component, OnInit, Inject } from '@angular/core';
import {
  FormControl,
  FormBuilder,
  Validators,
  FormGroup,
  FormGroupDirective,
  NgForm,
} from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import {
  MatDialogRef,
  MatDialog,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';

import { EnrollmentService } from './enrollment.service';
import { Observable } from 'rxjs';

export interface DialogData {
  firstName: any;
  lastName: any;
  email: string;
  gender: string;
  age: number;
  password: string;
  confirmPassword: string;
}

export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(
    control: FormControl | null,
    form: FormGroupDirective | NgForm | null
  ): boolean {
    const invalidCtrl = !!(control && control.invalid && control.parent.dirty);
    const invalidParent = !!(
      control &&
      control.parent &&
      control.parent.invalid &&
      control.parent.dirty
    );

    return (
      control.parent.errors &&
      control.parent.errors &&
      control.touched &&
      (invalidCtrl || invalidParent)
    );
  }
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  userForm: FormGroup;
  formDirective: FormGroupDirective;
  matcher = new MyErrorStateMatcher();
  emailRegx = /^(([^<>+()\[\]\\.,;:\s@"-#$%&=]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,3}))$/;
  data: DialogData;
  constructor(
    private formBuilder: FormBuilder,
    public dialog: MatDialog,
    private _enrollmentService: EnrollmentService
  ) {}

  ngOnInit() {
    this.userForm = this.formBuilder.group(
      {
        firstName: [
          '',
          [Validators.required, Validators.pattern('^[a-zA-Z]+$')],
        ],
        lastName: [
          '',
          [Validators.required, Validators.pattern('^[a-zA-Z]+$')],
        ],
        email: ['', [Validators.required, Validators.pattern(this.emailRegx)]],
        gender: ['Male', Validators.required],
        age: [
          20,
          [Validators.required, Validators.pattern('^[1-9][0-9]$|^(100)$')],
        ],
        password: ['', Validators.required],
        confirmPassword: ['', Validators.required],
      },
      { validator: this.checkPasswords }
    );
  }

  checkPasswords(group: FormGroup) {
    let pass = group.get('password').value;
    let confirmPassword = group.get('confirmPassword').value;

    return pass === confirmPassword ? null : { notSame: true };
  }

  openDialog() {
    let dataServer = this._enrollmentService.enroll(this.userForm.value);
    const dialogRef = this.dialog.open(DialogForm, { data: dataServer });

    dialogRef.afterClosed().subscribe((result) => {
      this.userForm.reset();
      this.userForm.patchValue({
        gender: 'Male',
        age: [20],
      });
      console.log(this.userForm);
    });
  }

  onSubmit(formData: any, formDirective: FormGroupDirective): void {
    formDirective.resetForm();
    this.userForm.reset();
  }
}

@Component({
  selector: 'dialog-content-example-dialog',
  templateUrl: './popup.component.html',
})
export class DialogForm {
  data: DialogData;
  constructor(
    public dialogRef: MatDialogRef<DialogForm>,
    @Inject(MAT_DIALOG_DATA) public dataForm: Observable<any>
  ) {}
  ngOnInit() {
    this.dataForm.subscribe((dataForm) => {
      this.data = dataForm;
      console.log(this.data);
    });
  }

  onSingUpClick(): void {
    this.dialogRef.close();
  }
}
