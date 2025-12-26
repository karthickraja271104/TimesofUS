import mongoose from "mongoose";

const memorySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      minlength: [3, "Title must be at least 3 characters"],
      maxlength: [100, "Title cannot exceed 100 characters"],
    },
    message: {
      type: String,
      required: [true, "Message is required"],
      minlength: [10, "Message must be at least 10 characters"],
    },
    date: {
      type: Date,
      required: [true, "Date is required"],
    },
    media: {
      type: {
        type: String,
        enum: ["image", "video", "audio", null],
        default: null,
      },
      url: String,
      publicId: String,
    },
    createdBy: {
      type: String,
      enum: ["him", "her"],
      required: [true, "Please specify who created this memory"],
    },
  },
  {
    timestamps: true,
    // Ensure date field is indexed for efficient sorting
    indexes: [{ date: -1 }],
  }
);

/**
 * Pre-save validation
 * Ensures media has both URL and publicId if type is set
 */
memorySchema.pre("save", function (next) {
  if (this.media.type && (!this.media.url || !this.media.publicId)) {
    return next(new Error("Media must have both URL and publicId"));
  }
  next();
});

/**
 * Instance method to convert media URLs to appropriate display format
 */
memorySchema.methods.formatResponse = function () {
  return {
    id: this._id,
    title: this.title,
    message: this.message,
    date: this.date,
    createdBy: this.createdBy,
    media: this.media.type
      ? {
          type: this.media.type,
          url: this.media.url,
          publicId: this.media.publicId,
        }
      : null,
    createdAt: this.createdAt,
  };
};

const Memory = mongoose.model("Memory", memorySchema);

export default Memory;
