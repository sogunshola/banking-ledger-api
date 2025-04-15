import { Model, Types } from 'mongoose';
import { BasicPaginationDto } from '../dto/basic-pagination.dto';

export class BasicService<T> {
  constructor(protected readonly model: Model<T>) {}

  async create(payload: Partial<T>): Promise<T> {
    const entity = new this.model(payload);
    return entity.save() as unknown as T;
  }

  async bulkCreate(payload: Partial<T>[]): Promise<T[]> {
    return this.model.insertMany(payload) as unknown as T[];
  }

  async findAll(
    filter = {},
    pagination: BasicPaginationDto,
    populateOptions?: string | any,
  ): Promise<{
    list: T[];
    pagination: {
      page: number;
      pageCount: number;
      limit: number;
      total: number;
      skipped: number;
      nextPage: boolean;
    };
  }> {
    const { page, limit } = pagination;
    const skip = (page - 1) * limit;

    const list = await this.model
      .find(filter)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .populate(populateOptions)
      .exec();
    const total = await this.model.countDocuments(filter);

    return {
      list,
      pagination: {
        page,
        pageCount: Math.ceil(total / limit),
        limit,
        total,
        skipped: skip,
        nextPage: page * limit < total,
      },
    };
  }

  async findOne(
    value: string | Types.ObjectId,
    key: keyof T,
  ): Promise<T | null> {
    // return this.model.findOne(filter).exec();
    return this.model
      .findOne({ [key]: value } as Record<string, any>)
      .exec() as unknown as T | null;
  }

  async update(filter: Partial<T>, payload: Partial<T>): Promise<T | null> {
    return this.model.findOneAndUpdate(filter, payload, { new: true }).exec();
  }

  async remove(filter: Partial<T>): Promise<{ deleted: boolean }> {
    const result = await this.model.deleteOne(filter).exec();
    return { deleted: result.deletedCount === 1 };
  }
}
