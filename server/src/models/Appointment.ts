import mongoose, { Document, Schema } from 'mongoose';

// Appointment type enum using const pattern
const APPOINTMENT_TYPE = {
  CONSULTATION: 'consultation',
  VACCINATION: 'vaccination',
  SURGERY: 'surgery',
  CHECKUP: 'checkup',
  EMERGENCY: 'emergency',
  OTHER: 'other',
} as const;

type AppointmentType = (typeof APPOINTMENT_TYPE)[keyof typeof APPOINTMENT_TYPE];

// Appointment status enum using const pattern
const APPOINTMENT_STATUS = {
  SCHEDULED: 'scheduled',
  CONFIRMED: 'confirmed',
  IN_PROGRESS: 'in-progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  NO_SHOW: 'no-show',
} as const;

type AppointmentStatus = (typeof APPOINTMENT_STATUS)[keyof typeof APPOINTMENT_STATUS];

export interface IAppointment extends Document {
  animal: mongoose.Types.ObjectId;
  veterinarian: mongoose.Types.ObjectId;
  date: Date;
  time: string;
  duration: number;
  type: AppointmentType;
  reason: string;
  status: AppointmentStatus;
  notes?: string;
  cancellationReason?: string;
  createdBy: mongoose.Types.ObjectId;
  toAppointmentResponse(): Omit<IAppointment, 'toAppointmentResponse'>;
}

const appointmentSchema = new Schema<IAppointment>(
  {
    animal: {
      type: Schema.Types.ObjectId,
      ref: 'Animal',
      required: [true, 'Animal is required'],
    },
    veterinarian: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Veterinarian is required'],
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
    },
    time: {
      type: String,
      required: [true, 'Time is required'],
      trim: true,
    },
    duration: {
      type: Number,
      default: 30,
      min: 15,
    },
    type: {
      type: String,
      required: [true, 'Appointment type is required'],
      enum: Object.values(APPOINTMENT_TYPE),
    },
    reason: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      default: APPOINTMENT_STATUS.SCHEDULED,
      enum: Object.values(APPOINTMENT_STATUS),
    },
    notes: {
      type: String,
    },
    cancellationReason: {
      type: String,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Creator is required'],
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes
appointmentSchema.index({ animal: 1, date: 1, time: 1, status: 1 });
appointmentSchema.index({ date: 1, status: 1 });
appointmentSchema.index({ veterinarian: 1, date: 1 });
appointmentSchema.index({ status: 1, createdAt: -1 });

// Virtual to format response (exclude internal methods, rename _id to id)
appointmentSchema.methods.toAppointmentResponse = function () {
  const obj = this.toObject();
  // Rename _id to id for consistency with frontend
  obj.id = obj._id;
  // Convert ObjectIds to strings
  if (obj.animal) obj.animal = obj.animal.toString();
  if (obj.veterinarian) obj.veterinarian = obj.veterinarian.toString();
  if (obj.createdBy) obj.createdBy = obj.createdBy.toString();
  delete obj._id;
  return obj;
};

const Appointment = mongoose.model<IAppointment>('Appointment', appointmentSchema);

export { APPOINTMENT_TYPE, AppointmentType, APPOINTMENT_STATUS, AppointmentStatus };
export default Appointment;