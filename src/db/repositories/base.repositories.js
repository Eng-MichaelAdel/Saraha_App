import { BadRequestException} from "../../common/index.js";

export class BaseRepository {
  constructor(model) {
    this.model = model;
  }

  //*   Create methods
  async createOne({ data = {}, options = {} } = {}) {
    const [doc] = await this.model.create([data], options);
    return doc;
  }

  createMany({ data: [{}], options = {} } = {}) {
    return this.model.create(data, options);
  }

  insertMany({ data: [{}], options = {} } = {}) {
    return this.model.insert(data, options);
  }

  saveDocument() {
    return this.model.save();
  }

  //*   Find methods
  findOne({ filter, select = {}, options = {} } = {}) {
    if (!filter || Object.keys(filter).length === 0) {
      throw new BadRequestException("filter is required");
      ;
    }
    let query = this.model.findOne(filter, select);

    if (options.populate) {
      query.populate(options.populate);
    }

    if (options.lean) {
      query = query.lean(options.lean);
    }

    return query.exec();
  }

  findById({ id, select = {}, options = {} } = {}) {
    let query = this.model.findById(id, select);

    if (options.populate) {
      query.populate(options.populate);
    }

    if (options.lean) {
      query = query.lean(options.lean);
    }

    return query.exec();
  }

  find({ filter = {}, select = {}, options = {} } = {}) {
    let query = this.model.find(filter, select);
    if (options.lean) {
      query.lean(options.lean);
    }
    if (options.populate) {
      query.populate(options.populate);
    }
    if (options.sort) {
      query.sort(options.sort);
    }
    if (options.skip) {
      query.skip(options.skip);
    }
    if (options.limit) {
      query.limit(options.limit);
    }

    return query.exec();
  }

  //*   Update methods
  updateOne({ filter, updates, options = {} } = {}) {
    if (!filter || Object.keys(filter).length === 0) {
      throw new BadRequestException("filter is required");
    }
    return this.model.updateOne(filter, { ...updates, $inc: { __v: 1 } }, { ...options, runValidators: true });
  }

  updateMany({ filter, updates, options = {} } = {}) {
    if (!filter || Object.keys(filter).length === 0) {
      throw new BadRequestException("filter is required");
    }
    return this.model.updateMany(filter, { ...updates, $inc: { __v: 1 } }, { ...options, runValidators: true });
  }

  findOneAndUpdate({ filter, updates, options = {} } = {}) {
    if (!filter || Object.keys(filter).length === 0) {
      throw new BadRequestException("filter is required");
    }
    return this.model.findOneAndUpdate(filter, { ...updates, $inc: { __v: 1 } }, { ...options, runValidators: true, new: true });
  }

  findByIdAndUpdate({ id, updates, options = {} } = {}) {
    return this.model.findByIdAndUpdate(id, { ...updates, $inc: { __v: 1 } }, { ...options, runValidators: true, new: true });
  }

  findOneAndReplace({ filter, updates, options = {} } = {}) {
    if (!filter || Object.keys(filter).length === 0) {
      throw new BadRequestException("filter is required");
    }
    return this.model.findOneAndReplace(filter, { ...updates, $inc: { __v: 1 } }, { ...options, runValidators: true, new: true });
  }

  //*   Delete methods
  deleteOne({ filter } = {}) {
    if (!filter || Object.keys(filter).length === 0) {
      throw new BadRequestException("filter is required");
    }
    return this.model.deleteOne(filter);
  }

  deleteMany({ filter } = {}) {
    if (!filter || Object.keys(filter).length === 0) {
      throw new BadRequestException("filter is required");
    }
    return this.model.deleteMany(filter);
  }

  findOneAndDelete({ filter } = {}) {
    if (!filter || Object.keys(filter).length === 0) {
      throw new BadRequestException("filter is required");
    }
    return this.model.findOneAndDelete(filter);
  }

  findByIdAndDelete(id) {
    return this.model.findByIdAndDelete(id);
  }
}
