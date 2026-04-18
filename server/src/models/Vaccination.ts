import mongoose, { Document, Schema } from 'mongoose';

export interface IVaccination extends Document {
  animal: mongoose.Types.ObjectId;
  name: string;
  dateAdministered: Date;
  nextDueDate?: Date;
  batchNumber?: string;
  laboratory?: string;
  notes?: string;
  veterinarian?: mongoose.Types.ObjectId;
  reminderSent: boolean;
  reminderDate?: Date;
  toVaccinationResponse(): Omit<IVaccination, 'toVaccinationResponse'> & { id: string };
}

const vaccinationSchema = new Schema<IVaccination>(
  {
    animal: {
      type: Schema.Types.ObjectId,
      ref: 'Animal',
      required: [true, 'Animal is required'],
    },
    name: {
      type: String,
      required: [true, 'Vaccination name is required'],
      trim: true,
    },
    dateAdministered: {
      type: Date,
      required: [true, 'Date administered is required'],
    },
    nextDueDate: {
      type: Date,
    },
    batchNumber: {
      type: String,
      trim: true,
    },
    laboratory: {
      type: String,
      trim: true,
    },
    notes: {
      type: String,
    },
    veterinarian: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    reminderSent: {
      type: Boolean,
      default: false,
    },
    reminderDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for common queries
vaccinationSchema.index({ animal: 1 });
vaccinationSchema.index({ nextDueDate: 1 });
vaccinationSchema.index({ reminderSent: 1, nextDueDate: 1 });

// Virtual to format response (exclude internal methods, rename _id to id)
vaccinationSchema.methods.toVaccinationResponse = function () {
  const obj = this.toObject();
  // Rename _id to id for consistency with frontend
  obj.id = obj._id;
  delete obj._id;
  return obj;
};

const Vaccination = mongoose.model<IVaccination>('Vaccination', vaccinationSchema);

export default Vaccination;