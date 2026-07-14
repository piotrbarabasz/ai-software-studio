import { CommonModule } from '@angular/common';
import type { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, inject } from '@angular/core';
import type { OnInit } from '@angular/core';
import type { FormControl } from '@angular/forms';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { finalize } from 'rxjs';

import { budgetRangeOptions, projectTypeOptions } from '../../core/content/contact-options.pl';
import { plContent } from '../../core/content/pl';
import { ContactApiService } from '../../services/contact-api.service';
import type {
  BudgetRange,
  ContactInquiryRequest,
  ProjectType,
} from '../../services/contact-api.types';

type ContactFormControls = {
  name: FormControl<string>;
  email: FormControl<string>;
  company: FormControl<string>;
  projectType: FormControl<string>;
  budgetRange: FormControl<string>;
  message: FormControl<string>;
  consent: FormControl<boolean>;
};

@Component({
  selector: 'app-contact-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './contact-form.component.html',
  styleUrl: './contact-form.component.scss',
})
export class ContactFormComponent implements OnInit {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly api = inject(ContactApiService);
  private readonly route = inject(ActivatedRoute, { optional: true });
  private readonly destroyRef = inject(DestroyRef);

  readonly content = {
    ...plContent.contact,
    projectTypes: projectTypeOptions,
    budgetRanges: budgetRangeOptions,
  };
  readonly form = this.fb.group<ContactFormControls>({
    name: this.fb.control('', [
      Validators.required,
      Validators.minLength(2),
      Validators.maxLength(120),
    ]),
    email: this.fb.control('', [Validators.required, Validators.email, Validators.maxLength(254)]),
    company: this.fb.control('', [Validators.maxLength(160)]),
    projectType: this.fb.control('', [Validators.required]),
    budgetRange: this.fb.control('', [Validators.required]),
    message: this.fb.control('', [
      Validators.required,
      Validators.minLength(20),
      Validators.maxLength(4000),
    ]),
    consent: this.fb.control(false, [Validators.requiredTrue]),
  });

  isSubmitting = false;
  status: 'idle' | 'success' | 'error' = 'idle';
  statusMessage = '';

  ngOnInit(): void {
    if (!this.route) {
      return;
    }

    this.route.queryParamMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      const requestedProjectType = params.get('projectType');
      this.form.controls.projectType.setValue(
        this.isProjectType(requestedProjectType) ? requestedProjectType : '',
      );
    });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.status = 'error';
      this.statusMessage = this.content.messages.validation;
      return;
    }

    this.isSubmitting = true;
    this.status = 'idle';
    this.statusMessage = '';

    this.api
      .submit(this.toPayload())
      .pipe(finalize(() => (this.isSubmitting = false)))
      .subscribe({
        next: () => {
          this.status = 'success';
          this.statusMessage = this.content.messages.success;
          this.form.reset({
            name: '',
            email: '',
            company: '',
            projectType: '',
            budgetRange: '',
            message: '',
            consent: false,
          });
        },
        error: (error: HttpErrorResponse) => {
          this.status = 'error';
          this.statusMessage = this.messageForError(error);
        },
      });
  }

  isInvalid(controlName: keyof ContactFormControls): boolean {
    const control = this.form.controls[controlName];
    return control.invalid && (control.dirty || control.touched);
  }

  errorFor(controlName: keyof ContactFormControls): string {
    const control = this.form.controls[controlName];
    if (control.hasError('required') || control.hasError('requiredTrue')) {
      return 'To pole jest wymagane.';
    }
    if (control.hasError('email')) {
      return 'Podaj poprawny adres e-mail.';
    }
    if (control.hasError('minlength')) {
      return 'Wpisz więcej szczegółów.';
    }
    if (control.hasError('maxlength')) {
      return 'Wpis jest zbyt długi.';
    }
    return 'Sprawdź wartość pola.';
  }

  private isProjectType(value: string | null): value is ProjectType {
    return value !== null && projectTypeOptions.some((option) => option.value === value);
  }

  private toPayload(): ContactInquiryRequest {
    const raw = this.form.getRawValue();
    return {
      name: raw.name.trim(),
      email: raw.email.trim(),
      company: raw.company.trim() || null,
      projectType: raw.projectType as ProjectType,
      budgetRange: raw.budgetRange as BudgetRange,
      message: raw.message.trim(),
      consent: true,
    };
  }

  private messageForError(error: HttpErrorResponse): string {
    if (error.status === 429) {
      return this.content.messages.rateLimit;
    }
    if (error.status === 503) {
      return this.content.messages.deliveryFailed;
    }
    if (error.status === 422) {
      return this.content.messages.validation;
    }
    return this.content.messages.genericError;
  }
}
