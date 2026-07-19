import type { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, ViewChild, inject, ChangeDetectionStrategy } from '@angular/core';
import type { ElementRef, OnInit } from '@angular/core';
import type { FormControl } from '@angular/forms';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import {
  budgetRangeOptions,
  projectTypeFromQuery,
  projectTypeOptions,
  type VisibleProjectType,
} from '../../core/content/contact-options.pl';
import { siteContent } from '../../core/content/site.pl';
import type { ContactPageContent } from '../../core/content/site-content.types';
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
  website: FormControl<string>;
};

interface SubmissionSummary {
  readonly name: string;
  readonly projectType: string;
  readonly message: string;
}

@Component({
  selector: 'app-contact-form',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './contact-form.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './contact-form.component.scss',
})
export class ContactFormComponent implements OnInit {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly api = inject(ContactApiService);
  private readonly route = inject(ActivatedRoute, { optional: true });
  private readonly destroyRef = inject(DestroyRef);

  @ViewChild('errorSummary') private readonly errorSummary?: ElementRef<HTMLElement>;
  @ViewChild('successMessage') private readonly successMessage?: ElementRef<HTMLElement>;

  readonly content: ContactPageContent = siteContent.contact;
  readonly form = this.fb.group<ContactFormControls>({
    name: this.fb.control('', [
      Validators.required,
      Validators.minLength(2),
      Validators.maxLength(120),
    ]),
    email: this.fb.control('', [Validators.required, Validators.email, Validators.maxLength(254)]),
    company: this.fb.control('', [Validators.maxLength(160)]),
    projectType: this.fb.control('', [Validators.required]),
    budgetRange: this.fb.control(''),
    message: this.fb.control('', [
      Validators.required,
      Validators.minLength(20),
      Validators.maxLength(4000),
    ]),
    consent: this.fb.control(false, [Validators.requiredTrue]),
    website: this.fb.control(''),
  });

  isSubmitting = false;
  status: 'idle' | 'success' | 'error' = 'idle';
  statusMessage = '';
  submissionSummary?: SubmissionSummary;

  ngOnInit(): void {
    if (!this.route) {
      return;
    }

    this.route.queryParamMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      const requestedProjectType = projectTypeFromQuery(params.get('projectType'));
      if (!this.form.controls.projectType.dirty && requestedProjectType !== null) {
        this.form.controls.projectType.setValue(requestedProjectType, { emitEvent: false });
      }
    });
  }

  submit(): void {
    if (this.isSubmitting) {
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.status = 'error';
      this.statusMessage = this.content.messages.validation;
      this.focusStatusMessage('error');
      return;
    }

    this.isSubmitting = true;
    this.status = 'idle';
    this.statusMessage = '';

    const inquiry = this.toPayload();

    this.api
      .submit(inquiry)
      .pipe(finalize(() => (this.isSubmitting = false)))
      .subscribe({
        next: () => {
          this.status = 'success';
          this.statusMessage = this.content.messages.success;
          this.submissionSummary = {
            name: inquiry.name,
            projectType: this.projectTypeLabel(inquiry.projectType),
            message: this.messagePreview(inquiry.message),
          };
          this.resetForm();
          this.focusStatusMessage('success');
        },
        error: (error: HttpErrorResponse) => {
          this.status = 'error';
          this.statusMessage = this.messageForError(error);
          this.focusStatusMessage('error');
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

  resetForAnotherInquiry(): void {
    this.resetForm();
    this.status = 'idle';
    this.statusMessage = '';
    this.submissionSummary = undefined;
  }

  private isVisibleProjectType(value: string): value is VisibleProjectType {
    return projectTypeOptions.some((option) => option.value === value);
  }

  private isBudgetRange(value: string): value is BudgetRange {
    return budgetRangeOptions.some((option) => option.value === value);
  }

  private toPayload(): ContactInquiryRequest {
    const raw = this.form.getRawValue();
    return {
      name: raw.name.trim(),
      email: raw.email.trim(),
      company: raw.company.trim() || null,
      projectType: this.isVisibleProjectType(raw.projectType) ? raw.projectType : 'other',
      budgetRange: this.isBudgetRange(raw.budgetRange) ? raw.budgetRange : 'not_sure',
      message: raw.message.trim(),
      consent: true,
      website: raw.website.trim(),
    };
  }

  private projectTypeLabel(projectType: ProjectType): string {
    return (
      this.content.projectTypes.find((option) => option.value === projectType)?.label ?? projectType
    );
  }

  private messagePreview(message: string): string {
    const maximumLength = 240;

    return message.length <= maximumLength
      ? message
      : `${message.slice(0, maximumLength).trimEnd()}…`;
  }

  private messageForError(error: HttpErrorResponse): string {
    if (error.status === 0) {
      return this.content.messages.apiUnavailable;
    }
    if (error.status === 429) {
      return this.content.messages.rateLimit;
    }
    if (error.status === 422) {
      return this.content.messages.validation;
    }
    return this.content.messages.serverError;
  }

  private resetForm(): void {
    this.form.reset({
      name: '',
      email: '',
      company: '',
      projectType: '',
      budgetRange: '',
      message: '',
      consent: false,
      website: '',
    });
  }

  private focusStatusMessage(target: 'error' | 'success'): void {
    setTimeout(() => {
      const element =
        target === 'error' ? this.errorSummary?.nativeElement : this.successMessage?.nativeElement;
      element?.focus();
    });
  }
}
