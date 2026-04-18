import mongoose, { Document, Schema } from 'mongoose';

// Species enum using const pattern
const SPECIES = {
  DOG: 'dog',
  CAT: 'cat',
  BIRD: 'bird',
  RABBIT: 'rabbit',
  OTHER: 'other',
} as const;

type AnimalSpecies = (typeof SPECIES)[keyof typeof SPECIES];

// Gender enum using const pattern
const GENDER = {
  MALE: 'male',
  FEMALE: 'female',
  UNKNOWN: 'unknown',
} as const;

type AnimalGender = (typeof GENDER)[keyof typeof GENDER];

export interface IAnimal extends Document {
  name: string;
  species: AnimalSpecies;
  breed?: string;
  color?: string;
  gender?: AnimalGender;
  birthDate?: Date;
  weight?: number;
  ownerName: string;
  ownerPhone: string;
  ownerEmail?: string;
  ownerAddress?: string;
  notes?: string;
  isActive: boolean;
  toAnimalResponse(): Omit<IAnimal, 'toAnimalResponse'>;
}

const animalSchema = new Schema<IAnimal>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    species: {
      type: String,
      required: [true, 'Species is required'],
      enum: Object.values(SPECIES),
    },
    breed: {
      type: String,
      trim: true,
    },
    color: {
      type: String,
      trim: true,
    },
    gender: {
      type: String,
      enum: Object.values(GENDER),
    },
    birthDate: {
      type: Date,
    },
    weight: {
      type: Number,
      min: 0,
    },
    ownerName: {
      type: String,
      required: [true, 'Owner name is required'],
      trim: true,
    },
    ownerPhone: {
      type: String,
      required: [true, 'Owner phone is required'],
      trim: true,
    },
    ownerEmail: {
      type: String,
      lowercase: true,
      trim: true,
    },
    ownerAddress: {
      type: String,
      trim: true,
    },
    notes: {
      type: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
animalSchema.index({ name: 'text', ownerName: 'text', ownerPhone: 'text' });
animalSchema.index({ species: 1 });
animalSchema.index({ isActive: 1 });
animalSchema.index({ createdAt: -1 });

// Virtual to format response (exclude internal methods, rename _id to id)
animalSchema.methods.toAnimalResponse = function () {
  const obj = this.toObject();
  // Rename _id to id for consistency with frontend
  obj.id = obj._id;
  delete obj._id;
  return obj;
};

const Animal = mongoose.model<IAnimal>('Animal', animalSchema);

export { SPECIES, AnimalSpecies, GENDER, AnimalGender };
export default Animal;