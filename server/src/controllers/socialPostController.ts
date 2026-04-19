import { Request, Response } from 'express';
import SocialPost from '../models/SocialPost';
import { POST_STATUS, PLATFORM } from '../models/SocialPost';

const successResponse = (res: Response, data: unknown, status = 200) => {
  res.status(status).json({ success: true, data });
};

const errorResponse = (res: Response, message: string, code = 'INTERNAL_ERROR', status = 500, details?: unknown) => {
  res.status(status).json({ success: false, error: { code, message, details } });
};

// Transform social post for response
const transformPost = (post: any) => {
  const obj = post.toObject ? post.toObject() : post;
  obj.id = obj._id;
  delete obj._id;
  return obj;
};

// Get all social posts with filters
export const getSocialPosts = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, platform, page = '1', limit = '20' } = req.query;

    const query: any = {};
    if (status && typeof status === 'string') {
      query.status = status;
    }
    if (platform && typeof platform === 'string') {
      query.platforms = platform;
    }

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const [posts, total] = await Promise.all([
      SocialPost.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .populate('createdBy', 'name')
        .lean(),
      SocialPost.countDocuments(query),
    ]);

    const postsResponse = posts.map(transformPost);

    successResponse(res, {
      posts: postsResponse,
      pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (error) {
    console.error('GetSocialPosts error:', error);
    errorResponse(res, 'Internal server error', 'INTERNAL_ERROR');
  }
};

// Get single social post
export const getSocialPostById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const post = await SocialPost.findById(id)
      .populate('createdBy', 'name')
      .lean();

    if (!post) {
      errorResponse(res, 'Social post not found', 'NOT_FOUND', 404);
      return;
    }

    successResponse(res, transformPost(post));
  } catch (error) {
    console.error('GetSocialPostById error:', error);
    errorResponse(res, 'Internal server error', 'INTERNAL_ERROR');
  }
};

// Create social post (draft)
export const createSocialPost = async (req: Request, res: Response): Promise<void> => {
  try {
    const { content, platforms, mediaUrls, scheduledDate } = req.body;

    if (!content) {
      errorResponse(res, 'Content is required', 'VALIDATION_ERROR', 400);
      return;
    }

    const userId = (req as any).user?.id || '000000000000000000000000';

    const post = new SocialPost({
      content,
      platforms: platforms || [],
      status: scheduledDate ? POST_STATUS.SCHEDULED : POST_STATUS.DRAFT,
      scheduledDate: scheduledDate ? new Date(scheduledDate) : undefined,
      mediaUrls,
      createdBy: userId,
    });

    await post.save();

    const populated = await SocialPost.findById(post._id)
      .populate('createdBy', 'name')
      .lean();

    successResponse(res, transformPost(populated), 201);
  } catch (error) {
    console.error('CreateSocialPost error:', error);
    errorResponse(res, 'Internal server error', 'INTERNAL_ERROR');
  }
};

// Update social post
export const updateSocialPost = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { content, platforms, status, scheduledDate, mediaUrls } = req.body;

    const updateData: any = {};
    if (content !== undefined) updateData.content = content;
    if (platforms !== undefined) updateData.platforms = platforms;
    if (status !== undefined) updateData.status = status;
    if (scheduledDate !== undefined) {
      updateData.scheduledDate = scheduledDate ? new Date(scheduledDate) : null;
      if (scheduledDate && status !== POST_STATUS.SCHEDULED) {
        updateData.status = POST_STATUS.SCHEDULED;
      }
    }
    if (mediaUrls !== undefined) updateData.mediaUrls = mediaUrls;

    const post = await SocialPost.findByIdAndUpdate(id, updateData, { new: true, runValidators: true })
      .populate('createdBy', 'name')
      .lean();

    if (!post) {
      errorResponse(res, 'Social post not found', 'NOT_FOUND', 404);
      return;
    }

    successResponse(res, transformPost(post));
  } catch (error) {
    console.error('UpdateSocialPost error:', error);
    errorResponse(res, 'Internal server error', 'INTERNAL_ERROR');
  }
};

// Delete social post
export const deleteSocialPost = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const post = await SocialPost.findByIdAndDelete(id);

    if (!post) {
      errorResponse(res, 'Social post not found', 'NOT_FOUND', 404);
      return;
    }

    successResponse(res, { message: 'Social post deleted successfully' });
  } catch (error) {
    console.error('DeleteSocialPost error:', error);
    errorResponse(res, 'Internal server error', 'INTERNAL_ERROR');
  }
};

// Schedule post
export const scheduleSocialPost = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { scheduledDate } = req.body;

    if (!scheduledDate) {
      errorResponse(res, 'Scheduled date is required', 'VALIDATION_ERROR', 400);
      return;
    }

    const post = await SocialPost.findByIdAndUpdate(
      id,
      { scheduledDate: new Date(scheduledDate), status: POST_STATUS.SCHEDULED },
      { new: true }
    )
      .populate('createdBy', 'name')
      .lean();

    if (!post) {
      errorResponse(res, 'Social post not found', 'NOT_FOUND', 404);
      return;
    }

    successResponse(res, transformPost(post));
  } catch (error) {
    console.error('ScheduleSocialPost error:', error);
    errorResponse(res, 'Internal server error', 'INTERNAL_ERROR');
  }
};

// Publish post (stub for v1)
export const publishSocialPost = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const post = await SocialPost.findById(id);

    if (!post) {
      errorResponse(res, 'Social post not found', 'NOT_FOUND', 404);
      return;
    }

    if (post.status === POST_STATUS.PUBLISHED) {
      errorResponse(res, 'Post already published', 'ALREADY_PUBLISHED', 400);
      return;
    }

    // Stub: In v1, we just mark it as published
    // Real implementation would call Facebook/Instagram API
    post.status = POST_STATUS.PUBLISHED;
    post.publishedDate = new Date();
    await post.save();

    const populated = await SocialPost.findById(id)
      .populate('createdBy', 'name')
      .lean();

    successResponse(res, transformPost(populated));
  } catch (error) {
    console.error('PublishSocialPost error:', error);
    errorResponse(res, 'Internal server error', 'INTERNAL_ERROR');
  }
};

export default {
  getSocialPosts,
  getSocialPostById,
  createSocialPost,
  updateSocialPost,
  deleteSocialPost,
  scheduleSocialPost,
  publishSocialPost,
};