import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

const ROLE = {
  ADMIN: 'admin',
  SECRETARY: 'secretary',
} as const;

type UserRole = (typeof ROLE)[keyof typeof ROLE];

export interface IUser extends Document {
  email: string;
  password: string;
  name: string;
  role: UserRole;
  isActive: boolean;
  lastLogin: Date | null;
  comparePassword(candidatePassword: string): Promise<boolean>;
  toUserResponse(): Omit<IUser, 'password'>;
}

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 8,
      select: false,
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    role: {
      type: String,
      enum: Object.values(ROLE),
      default: ROLE.SECRETARY,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });

// Pre-save hook for bcrypt
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Virtual to exclude password from responses
userSchema.methods.toUserResponse = function () {
  const obj = this.toObject();
  delete obj.password;
  // Rename _id to id for consistency with frontend
  obj.id = obj._id;
  delete obj._id;
  return obj;
};

const User = mongoose.model<IUser>('User', userSchema);

export { ROLE, UserRole };
export default User;