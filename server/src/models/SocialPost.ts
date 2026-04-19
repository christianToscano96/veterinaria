import mongoose, { Document, Schema } from 'mongoose';

// Social Post status enum
const POST_STATUS = {
  DRAFT: 'draft',
  SCHEDULED: 'scheduled',
  PUBLISHED: 'published',
  FAILED: 'failed',
} as const;

type PostStatus = (typeof POST_STATUS)[keyof typeof POST_STATUS];

// Platform enum
const PLATFORM = {
  FACEBOOK: 'facebook',
  INSTAGRAM: 'instagram',
} as const;

type Platform = (typeof PLATFORM)[keyof typeof PLATFORM];

export interface ISocialPost extends Document {
  content: string;
  platforms: Platform[];
  status: PostStatus;
  scheduledDate?: Date;
  publishedDate?: Date;
  mediaUrls?: string[];
  publishError?: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const socialPostSchema = new Schema<ISocialPost>(
  {
    content: {
      type: String,
      required: true,
    },
    platforms: [{
      type: String,
      enum: Object.values(PLATFORM),
    }],
    status: {
      type: String,
      enum: Object.values(POST_STATUS),
      default: POST_STATUS.DRAFT,
    },
    scheduledDate: Date,
    publishedDate: Date,
    mediaUrls: [String],
    publishError: String,
    createdBy: {
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
socialPostSchema.index({ status: 1 });
socialPostSchema.index({ scheduledDate: 1 });

const SocialPost = mongoose.model<ISocialPost>('SocialPost', socialPostSchema);

export { POST_STATUS, PostStatus, PLATFORM, Platform };
export default SocialPost;