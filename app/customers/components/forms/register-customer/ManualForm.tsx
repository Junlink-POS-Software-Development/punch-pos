import { UseFormRegister, FieldErrors } from "react-hook-form";
import { User, Phone, Mail, Users, MapPin, Calendar, Heart, FileText } from "lucide-react";
import { CustomerFormValues, CustomerGroup } from "../../../lib/types";

interface ManualFormProps {
  register: UseFormRegister<CustomerFormValues>;
  errors: FieldErrors<CustomerFormValues>;
  groups: CustomerGroup[];
}

export const ManualForm = ({ register, errors, groups }: ManualFormProps) => {
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
            className={`bg-muted/50 focus:bg-muted px-4 py-3 border ${errors.full_name ? 'border-red-500/50' : 'border-border'} focus:border-primary/50 rounded-xl focus:outline-none w-full text-foreground placeholder:text-muted-foreground/60 transition-all`}
            placeholder="e.g. Juan Dela Cruz"
          />
          {errors.full_name && (
            <p className="text-red-400 text-xs">
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
            className="bg-muted/50 focus:bg-muted px-4 py-3 border border-border focus:border-primary/50 rounded-xl focus:outline-none w-full text-foreground placeholder:text-muted-foreground/60 transition-all"
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
            className="bg-muted/50 focus:bg-muted px-4 py-3 border border-border focus:border-primary/50 rounded-xl focus:outline-none w-full text-foreground placeholder:text-muted-foreground/60 transition-all"
            placeholder="juan@example.com"
          />
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2 font-medium text-muted-foreground text-sm">
            <Users className="w-4 h-4 text-primary" /> Customer Group *
          </label>
          <select
            {...register("group_id")}
            onKeyDown={(e) => handleKeyDown(e, "address")}
            className={`bg-muted/50 focus:bg-muted px-4 py-3 border ${errors.group_id ? 'border-red-500/50' : 'border-border'} focus:border-primary/50 rounded-xl focus:outline-none w-full text-foreground placeholder:text-muted-foreground/60 transition-all appearance-none`}
          >
            <option value="">Select Group</option>
            {groups.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>
          {errors.group_id && (
            <p className="text-red-400 text-xs">
              {errors.group_id.message}
            </p>
          )}
        </div>
      </div>

      {/* ROW 3: Address */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 font-medium text-muted-foreground text-sm">
          <MapPin className="w-4 h-4 text-primary" /> Complete Address
        </label>
        <input
          {...register("address")}
          onKeyDown={(e) => handleKeyDown(e, "birthdate")}
          className="bg-slate-950/50 focus:bg-slate-950 px-4 py-3 border border-slate-800 focus:border-cyan-500/50 rounded-xl focus:outline-none w-full text-white placeholder:text-slate-600 transition-all"
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
            className={`bg-muted/50 focus:bg-muted px-4 py-3 border ${errors.birthdate ? 'border-red-500/50' : 'border-border'} focus:border-primary/50 rounded-xl focus:outline-none w-full text-foreground placeholder:text-muted-foreground/60 transition-all`}
          />
          {errors.birthdate && (
            <p className="text-red-400 text-xs">
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
            className={`bg-muted/50 focus:bg-muted px-4 py-3 border ${errors.date_of_registration ? 'border-red-500/50' : 'border-border'} focus:border-primary/50 rounded-xl focus:outline-none w-full text-foreground placeholder:text-muted-foreground/60 transition-all`}
          />
          {errors.date_of_registration && (
            <p className="text-red-400 text-xs">
              {errors.date_of_registration.message}
            </p>
          )}
        </div>
      </div>

      {/* ROW 5: Civil Status & Gender */}
      <div className="gap-4 grid md:grid-cols-2">
        <div className="space-y-2">
          <label className="flex items-center gap-2 font-medium text-muted-foreground text-sm">
            <Heart className="w-4 h-4 text-primary" /> Civil Status *
          </label>
          <select
            {...register("civil_status")}
            onKeyDown={(e) => handleKeyDown(e, "gender")}
            className={`bg-muted/50 focus:bg-muted px-4 py-3 border ${errors.civil_status ? 'border-red-500/50' : 'border-border'} focus:border-primary/50 rounded-xl focus:outline-none w-full text-foreground placeholder:text-muted-foreground/60 transition-all appearance-none`}
          >
            <option value="">Select Status</option>
            <option value="Single">Single</option>
            <option value="Married">Married</option>
            <option value="Widowed">Widowed</option>
            <option value="Divorced">Divorced</option>
            <option value="Separated">Separated</option>
          </select>
          {errors.civil_status && (
            <p className="text-red-400 text-xs">
              {errors.civil_status.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2 font-medium text-muted-foreground text-sm">
            <User className="w-4 h-4 text-primary" /> Gender *
          </label>
          <select
            {...register("gender")}
            onKeyDown={(e) => handleKeyDown(e, "remarks")}
            className={`bg-muted/50 focus:bg-muted px-4 py-3 border ${errors.gender ? 'border-red-500/50' : 'border-border'} focus:border-primary/50 rounded-xl focus:outline-none w-full text-foreground placeholder:text-muted-foreground/60 transition-all appearance-none`}
          >
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Not Specified">Not Specified</option>
          </select>
          {errors.gender && (
            <p className="text-red-400 text-xs">
              {errors.gender.message}
            </p>
          )}
        </div>
      </div>

      {/* ROW 5: Remarks */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 font-medium text-muted-foreground text-sm">
          <FileText className="w-4 h-4 text-primary" /> Remarks / Notes
        </label>
        <textarea
          {...register("remarks")}
          onKeyDown={(e) => handleKeyDown(e)}
          rows={2}
          className="bg-muted/50 focus:bg-muted px-4 py-3 border border-border focus:border-primary/50 rounded-xl focus:outline-none w-full text-foreground placeholder:text-muted-foreground/60 transition-all resize-none"
          placeholder="Any additional info..."
        />
      </div>
    </div>
  );
};
