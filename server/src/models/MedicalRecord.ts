import mongoose, { Document, Schema } from 'mongoose';

// Medical Record type enum
const RECORD_TYPE = {
  CONSULTATION: 'consultation',
  SURGERY: 'surgery',
  TREATMENT: 'treatment',
  DIAGNOSIS: 'diagnosis',
  CHECKUP: 'checkup',
  OTHER: 'other',
} as const;

type RecordType = (typeof RECORD_TYPE)[keyof typeof RECORD_TYPE];

export interface IMedicalRecord extends Document {
  animal: mongoose.Types.ObjectId;
  appointment?: mongoose.Types.ObjectId;
  date: Date;
  type: RecordType;
  diagnosis?: string;
  treatment?: string;
  medication?: string;
  dosage?: string;
  notes?: string;
  attachments?: string[];
  veterinarian: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const medicalRecordSchema = new Schema<IMedicalRecord>(
  {
    animal: {
      type: Schema.Types.ObjectId,
      ref: 'Animal',
      required: true,
    },
    appointment: {
      type: Schema.Types.ObjectId,
      ref: 'Appointment',
    },
    date: {
      type: Date,
      required: true,
    },
    type: {
      type: String,
      enum: Object.values(RECORD_TYPE),
      required: true,
    },
    diagnosis: String,
    treatment: String,
    medication: String,
    dosage: String,
    notes: String,
    attachments: [String],
    veterinarian: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
medicalRecordSchema.index({ animal: 1, date: -1 });
medicalRecordSchema.index({ createdAt: -1 });

const MedicalRecord = mongoose.model<IMedicalRecord>('MedicalRecord', medicalRecordSchema);

export { RECORD_TYPE, RecordType };
export default MedicalRecord;