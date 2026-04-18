import { Request, Response } from 'express';
import Animal from '../models/Animal';
import {
  AnimalCreateSchema,
  AnimalUpdateSchema,
  PaginationQuerySchema,
} from '../schemas/animalSchema';

// Standard response format (duplicated from auth for independence)
const successResponse = (res: Response, data: unknown, status = 200) => {
  res.status(status).json({
    success: true,
    data,
  });
};

const errorResponse = (
  res: Response,
  message: string,
  code: string = 'INTERNAL_ERROR',
  status = 500,
  details?: unknown
) => {
  res.status(status).json({
    success: false,
    error: {
      code,
      message,
      details,
    },
  });
};

// Get all animals with pagination, search, and filters
export const getAnimals = async (req: Request, res: Response): Promise<void> => {
  try {
    const queryResult = PaginationQuerySchema.safeParse(req.query);

    if (!queryResult.success) {
      errorResponse(res, 'Invalid query parameters', 'VALIDATION_ERROR', 400, queryResult.error.issues);
      return;
    }

    const { page, limit, search, species, isActive } = queryResult.data;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter: Record<string, unknown> = {};

    if (species) {
      filter.species = species;
    }

    if (isActive !== undefined) {
      filter.isActive = isActive;
    }

    // Search across name, ownerName, and ownerPhone
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { ownerName: { $regex: search, $options: 'i' } },
        { ownerPhone: { $regex: search, $options: 'i' } },
      ];
    }

    // Execute query with pagination
    const [animals, total] = await Promise.all([
      Animal.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Animal.countDocuments(filter),
    ]);

    // Transform to response format (use type assertion for _id deletion)
    const animalsResponse = animals.map((animal) => {
      const obj = { ...animal } as Record<string, unknown>;
      obj.id = obj._id;
      delete obj._id;
      return obj;
    });

    successResponse(res, {
      animals: animalsResponse,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('GetAnimals error:', error);
    errorResponse(res, 'Internal server error', 'INTERNAL_ERROR');
  }
};

// Get single animal by ID
export const getAnimal = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const animal = await Animal.findById(id).lean();

    if (!animal) {
      errorResponse(res, 'Animal not found', 'ANIMAL_NOT_FOUND', 404);
      return;
    }

    const animalResponse = { ...animal } as Record<string, unknown>;
    animalResponse.id = animalResponse._id;
    delete animalResponse._id;

    successResponse(res, animalResponse);
  } catch (error) {
    console.error('GetAnimal error:', error);
    // Check if it's a valid MongoDB ObjectId
    if (error instanceof Error && error.message.includes('ObjectId')) {
      errorResponse(res, 'Invalid animal ID', 'INVALID_ID', 400);
      return;
    }
    errorResponse(res, 'Internal server error', 'INTERNAL_ERROR');
  }
};

// Create new animal
export const createAnimal = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = AnimalCreateSchema.safeParse(req.body);

    if (!result.success) {
      errorResponse(res, 'Validation failed', 'VALIDATION_ERROR', 400, result.error.issues);
      return;
    }

    const animal = new Animal(result.data);
    await animal.save();

    const animalResponse = animal.toAnimalResponse();

    successResponse(res, animalResponse, 201);
  } catch (error) {
    console.error('CreateAnimal error:', error);
    errorResponse(res, 'Internal server error', 'INTERNAL_ERROR');
  }
};

// Update animal
export const updateAnimal = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const result = AnimalUpdateSchema.safeParse(req.body);

    if (!result.success) {
      errorResponse(res, 'Validation failed', 'VALIDATION_ERROR', 400, result.error.issues);
      return;
    }

    const animal = await Animal.findByIdAndUpdate(
      id,
      { $set: result.data },
      { new: true, runValidators: true }
    );

    if (!animal) {
      errorResponse(res, 'Animal not found', 'ANIMAL_NOT_FOUND', 404);
      return;
    }

    const animalResponse = animal.toAnimalResponse();

    successResponse(res, animalResponse);
  } catch (error) {
    console.error('UpdateAnimal error:', error);
    // Check if it's a valid MongoDB ObjectId
    if (error instanceof Error && error.message.includes('ObjectId')) {
      errorResponse(res, 'Invalid animal ID', 'INVALID_ID', 400);
      return;
    }
    errorResponse(res, 'Internal server error', 'INTERNAL_ERROR');
  }
};

// Delete animal (soft delete)
export const deleteAnimal = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const animal = await Animal.findByIdAndUpdate(
      id,
      { $set: { isActive: false } },
      { new: true }
    );

    if (!animal) {
      errorResponse(res, 'Animal not found', 'ANIMAL_NOT_FOUND', 404);
      return;
    }

    successResponse(res, { message: 'Animal deleted successfully' });
  } catch (error) {
    console.error('DeleteAnimal error:', error);
    // Check if it's a valid MongoDB ObjectId
    if (error instanceof Error && error.message.includes('ObjectId')) {
      errorResponse(res, 'Invalid animal ID', 'INVALID_ID', 400);
      return;
    }
    errorResponse(res, 'Internal server error', 'INTERNAL_ERROR');
  }
};

export default {
  getAnimals,
  getAnimal,
  createAnimal,
  updateAnimal,
  deleteAnimal,
};