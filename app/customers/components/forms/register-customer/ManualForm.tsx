"use client";

import React from "react";
import { UseFormRegister, FieldErrors } from "react-hook-form";
import { User, Phone, Mail, MapPin, Calendar, FileText } from "lucide-react";
import { CustomerFormValues, CustomerGroup } from "../../../lib/types";
import { StandardSelect } from "@/components/reusables/StandardSelect";

interface ManualFormProps {
  register: UseFormRegister<CustomerFormValues>;
  errors: FieldErrors<CustomerFormValues>;
  groups: CustomerGroup[];
}

/**
 * ─── Manual Customer Form ───────────────────────────────────────────────────
 * Form fields for manual customer registration and editing.
 */
export function ManualForm({ register, errors, groups }: ManualFormProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLElement>, nextField?: string) => {
    if (e.key === "Enter") {
      if (e.shiftKey) return;
      e.preventDefault();

      if (e.currentTarget instanceof HTMLSelectElement) {
        try {
          (e.currentTarget as any).showPicker();
          return;
        } catch (err) {}
      }

      if (nextField) {
        const nextInput = document.querySelector(`[name="${nextField}"]`) as HTMLElement;
        if (nextInput) nextInput.focus();
      } else {
        e.currentTarget.closest("form")?.requestSubmit();
      }
    }
  };

  const inputClasses = (hasError: boolean) => `
    w-full bg-background border rounded-xl py-3 px-4 text-foreground 
    placeholder:text-muted-foreground/60 transition-all outline-none
    focus:ring-1 focus:ring-ring
    ${hasError ? 'border-red-500 focus:border-red-500' : 'border-input focus:border-ring'}
  `;

  return (
    <div className="space-y-6">
      {/* ROW 1: Name & Phone */}
      <div className="gap-4 grid md:grid-cols-2">
        <div className="space-y-2">
          <label className="flex items-center gap-2 font-medium text-muted-foreground text-sm">
            <User className="w-4 h-4 text-primary" /> Full Name *
          </label>
          <input
            {...register("full_name")}
            onKeyDown={(e) => handleKeyDown(e, "phone_number")}
            className={inputClasses(!!errors.full_name)}
            placeholder="e.g. Juan Dela Cruz"
          />
          {errors.full_name && (
            <p className="text-red-500 text-xs mt-1">
              {errors.full_name.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2 font-medium text-muted-foreground text-sm">
            <Phone className="w-4 h-4 text-primary" /> Phone Number
          </label>
          <input
            {...register("phone_number")}
            onKeyDown={(e) => handleKeyDown(e, "email")}
            className={inputClasses(!!errors.phone_number)}
            placeholder="0912 345 6789"
          />
        </div>
      </div>

      {/* ROW 2: Email & Group */}
      <div className="gap-4 grid md:grid-cols-2">
        <div className="space-y-2">
          <label className="flex items-center gap-2 font-medium text-muted-foreground text-sm">
            <Mail className="w-4 h-4 text-primary" /> Email Address
          </label>
          <input
            type="email"
            {...register("email")}
            onKeyDown={(e) => handleKeyDown(e, "group_id")}
            className={inputClasses(!!errors.email)}
            placeholder="juan@example.com"
          />
        </div>

        <StandardSelect
          label="Customer Group *"
          {...register("group_id")}
          error={errors.group_id?.message as string}
          onKeyDown={(e) => handleKeyDown(e, "address")}
        >
          <option value="" className="bg-background">Select Group</option>
          {groups.map((g) => (
            <option key={g.id} value={g.id} className="bg-background">
              {g.name}
            </option>
          ))}
        </StandardSelect>
      </div>

      {/* ROW 3: Address */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 font-medium text-muted-foreground text-sm">
          <MapPin className="w-4 h-4 text-primary" /> Complete Address
        </label>
        <input
          {...register("address")}
          onKeyDown={(e) => handleKeyDown(e, "birthdate")}
          className={inputClasses(!!errors.address)}
          placeholder="House No, Street, Barangay, City"
        />
      </div>

      {/* ROW 4: Dates */}
      <div className="gap-4 grid md:grid-cols-2">
        <div className="space-y-2">
          <label className="flex items-center gap-2 font-medium text-muted-foreground text-sm">
            <Calendar className="w-4 h-4 text-primary" /> Birthdate *
          </label>
          <input
            type="date"
            {...register("birthdate")}
            onKeyDown={(e) => handleKeyDown(e, "date_of_registration")}
            className={inputClasses(!!errors.birthdate)}
          />
          {errors.birthdate && (
            <p className="text-red-500 text-xs mt-1">
              {errors.birthdate.message}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <label className="flex items-center gap-2 font-medium text-muted-foreground text-sm">
            <Calendar className="w-4 h-4 text-primary" /> Registration Date *
          </label>
          <input
            type="date"
            {...register("date_of_registration")}
            onKeyDown={(e) => handleKeyDown(e, "civil_status")}
            className={inputClasses(!!errors.date_of_registration)}
          />
          {errors.date_of_registration && (
            <p className="text-red-500 text-xs mt-1">
              {errors.date_of_registration.message}
            </p>
          )}
        </div>
      </div>

      {/* ROW 5: Civil Status & Gender */}
      <div className="gap-4 grid md:grid-cols-2">
        <StandardSelect
          label="Civil Status *"
          {...register("civil_status")}
          error={errors.civil_status?.message as string}
          onKeyDown={(e) => handleKeyDown(e, "gender")}
        >
          <option value="" className="bg-background">Select Status</option>
          <option value="Single" className="bg-background">Single</option>
          <option value="Married" className="bg-background">Married</option>
          <option value="Widowed" className="bg-background">Widowed</option>
          <option value="Divorced" className="bg-background">Divorced</option>
          <option value="Separated" className="bg-background">Separated</option>
        </StandardSelect>

        <StandardSelect
          label="Gender *"
          {...register("gender")}
          error={errors.gender?.message as string}
          onKeyDown={(e) => handleKeyDown(e, "remarks")}
        >
          <option value="" className="bg-background">Select Gender</option>
          <option value="Male" className="bg-background">Male</option>
          <option value="Female" className="bg-background">Female</option>
          <option value="Not Specified" className="bg-background">Not Specified</option>
        </StandardSelect>
      </div>

      {/* ROW 6: Remarks */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 font-medium text-muted-foreground text-sm">
          <FileText className="w-4 h-4 text-primary" /> Remarks / Notes
        </label>
        <textarea
          {...register("remarks")}
          onKeyDown={(e) => handleKeyDown(e)}
          rows={2}
          className={`
            w-full bg-background border rounded-xl py-3 px-4 text-foreground 
            placeholder:text-muted-foreground/60 transition-all outline-none
            focus:ring-1 focus:ring-ring resize-none
            ${errors.remarks ? 'border-red-500 focus:border-red-500' : 'border-input focus:border-ring'}
          `}
          placeholder="Any additional info..."
        />
      </div>
    </div>
  );
}

