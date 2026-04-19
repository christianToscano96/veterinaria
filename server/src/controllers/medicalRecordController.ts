import { Request, Response } from 'express';
import MedicalRecord from '../models/MedicalRecord';
import { RECORD_TYPE } from '../models/MedicalRecord';

const successResponse = (res: Response, data: unknown, status = 200) => {
  res.status(status).json({ success: true, data });
};

const errorResponse = (res: Response, message: string, code = 'INTERNAL_ERROR', status = 500, details?: unknown) => {
  res.status(status).json({ success: false, error: { code, message, details } });
};

// Transform medical record for response
const transformRecord = (record: any) => {
  const obj = record.toObject ? record.toObject() : record;
  obj.id = obj._id;
  delete obj._id;
  return obj;
};

// Get medical records by animal ID
export const getMedicalRecordsByAnimal = async (req: Request, res: Response): Promise<void> => {
  try {
    const { animalId } = req.params;
    const { page = '1', limit = '20', type } = req.query;

    if (!animalId) {
      errorResponse(res, 'Animal ID is required', 'VALIDATION_ERROR', 400);
      return;
    }

    const query: any = { animal: animalId };
    if (type && typeof type === 'string') {
      query.type = type;
    }

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const [records, total] = await Promise.all([
      MedicalRecord.find(query)
        .sort({ date: -1 })
        .skip(skip)
        .limit(limitNum)
        .populate('veterinarian', 'name')
        .populate('appointment', 'date type')
        .lean(),
      MedicalRecord.countDocuments(query),
    ]);

    const recordsResponse = records.map(transformRecord);

    successResponse(res, {
      records: recordsResponse,
      pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (error) {
    console.error('GetMedicalRecordsByAnimal error:', error);
    errorResponse(res, 'Internal server error', 'INTERNAL_ERROR');
  }
};

// Get single medical record
export const getMedicalRecordById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const record = await MedicalRecord.findById(id)
      .populate('veterinarian', 'name')
      .populate('appointment')
      .populate('animal', 'name species ownerName')
      .lean();

    if (!record) {
      errorResponse(res, 'Medical record not found', 'NOT_FOUND', 404);
      return;
    }

    successResponse(res, transformRecord(record));
  } catch (error) {
    console.error('GetMedicalRecordById error:', error);
    errorResponse(res, 'Internal server error', 'INTERNAL_ERROR');
  }
};

// Create medical record
export const createMedicalRecord = async (req: Request, res: Response): Promise<void> => {
  try {
    const { animal, appointment, date, type, diagnosis, treatment, medication, dosage, notes, attachments } = req.body;

    if (!animal || !date || !type) {
      errorResponse(res, 'Animal, date and type are required', 'VALIDATION_ERROR', 400);
      return;
    }

    // Get veterinarian from auth (we'll add this later, for now use a placeholder)
    const veterinarian = (req as any).user?.id || '000000000000000000000000';

    const record = new MedicalRecord({
      animal,
      appointment,
      date: new Date(date),
      type,
      diagnosis,
      treatment,
      medication,
      dosage,
      notes,
      attachments,
      veterinarian,
    });

    await record.save();

    const populated = await MedicalRecord.findById(record._id)
      .populate('veterinarian', 'name')
      .lean();

    successResponse(res, transformRecord(populated), 201);
  } catch (error) {
    console.error('CreateMedicalRecord error:', error);
    errorResponse(res, 'Internal server error', 'INTERNAL_ERROR');
  }
};

// Update medical record
export const updateMedicalRecord = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { date, type, diagnosis, treatment, medication, dosage, notes, attachments } = req.body;

    const record = await MedicalRecord.findByIdAndUpdate(
      id,
      { date: date ? new Date(date) : undefined, type, diagnosis, treatment, medication, dosage, notes, attachments },
      { new: true, runValidators: true }
    )
      .populate('veterinarian', 'name')
      .lean();

    if (!record) {
      errorResponse(res, 'Medical record not found', 'NOT_FOUND', 404);
      return;
    }

    successResponse(res, transformRecord(record));
  } catch (error) {
    console.error('UpdateMedicalRecord error:', error);
    errorResponse(res, 'Internal server error', 'INTERNAL_ERROR');
  }
};

// Delete medical record
export const deleteMedicalRecord = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const record = await MedicalRecord.findByIdAndDelete(id);

    if (!record) {
      errorResponse(res, 'Medical record not found', 'NOT_FOUND', 404);
      return;
    }

    successResponse(res, { message: 'Medical record deleted successfully' });
  } catch (error) {
    console.error('DeleteMedicalRecord error:', error);
    errorResponse(res, 'Internal server error', 'INTERNAL_ERROR');
  }
};

export default {
  getMedicalRecordsByAnimal,
  getMedicalRecordById,
  createMedicalRecord,
  updateMedicalRecord,
  deleteMedicalRecord,
};