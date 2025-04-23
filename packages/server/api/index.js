// src/index.ts
import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import "dotenv/config";

// src/db.ts
import mongoose from "mongoose";

// src/lib/logger.ts
var colors = {
  red: "\x1B[31m",
  green: "\x1B[32m",
  reset: "\x1B[0m"
};
var logger = {
  error: ({ identifier, message }) => {
    console.error(
      `${colors.red}[${identifier}_error]${colors.reset}: ${message}`
    );
  },
  information: ({ identifier, message }) => {
    console.log(
      `${colors.green}[${identifier}_information]${colors.reset}: ${message}`
    );
  }
};

// src/db.ts
var db = {
  connect: async () => {
    try {
      const uri = process.env.DB_URI;
      await mongoose.connect(uri);
    } catch (error) {
      if (error instanceof Error) {
        logger.error({
          identifier: "database_connection",
          message: error.message
        });
      }
    }
  }
};

// src/routes.ts
import { Router } from "express";
import multer from "multer";

// src/controller/auth.ts
import { z as z3 } from "zod";
import bcrypt2 from "bcrypt";
import jwt2 from "jsonwebtoken";
import { loginActionSchema, registerActionSchema } from "@repo/validation";

// src/lib/validation.ts
import { z } from "zod";
import { Types } from "mongoose";

// src/lib/errors.ts
var NotFoundError = class extends Error {
  constructor(message) {
    super(message);
    this.status = 404;
  }
};
var HandlerError = class extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
};
var ValidationError = class {
  constructor(error) {
    this.status = 400;
    this.message = error.format();
  }
};
var AuthError = class extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
};
var UnexpectedError = class extends Error {
  constructor(privateMessage, publicMessage, status, identifier) {
    super(privateMessage);
    this.publicMessage = publicMessage;
    this.status = status;
    this.identifier = identifier;
  }
};
var handleError = ({
  error,
  res
}) => {
  if (error instanceof ValidationError || error instanceof NotFoundError || error instanceof HandlerError || error instanceof AuthError) {
    return res.status(error.status).json({ error: error.message });
  }
  if (error instanceof UnexpectedError) {
    logger.error({ identifier: error.identifier, message: error.message });
    return res.status(error.status).json({ error: error.publicMessage });
  }
  logger.error({
    identifier: "handler_unknown",
    message: error instanceof Error ? error.message : "unknown error"
  });
  return res.status(500).json({ error: "something went wrong" });
};

// src/lib/validation.ts
var passwordSchema = z.string().min(8, "password must be at least 8 characters").max(20, "password cannot be longer than 20 characters").regex(/[A-Z]/, "password must contain at least one uppercase letter").regex(/[a-z]/, "password must contain at least one lowercase letter").regex(/\d/, "password must contain at least one digit").regex(/[!@#$%^&*]/, "password must contain at least one special character");
var usernameSchema = z.string().min(3, "username must be at least 3 characters").max(30, "username cannot be longer than 30 characters");
var imageSchema = z.object({
  name: z.string(),
  type: z.string(),
  size: z.number()
});
var tokenSchema = z.object({
  userId: z.string()
});
var objectIdSchema = z.preprocess(
  (value) => typeof value === "string" && Types.ObjectId.isValid(value) ? new Types.ObjectId(value) : value,
  z.instanceof(Types.ObjectId)
);
var multipartFormBoolean = z.preprocess(
  (value) => typeof value === "string" ? value === "true" : false,
  z.boolean()
);
var multipartFormObjectIdArray = z.preprocess(
  (value) => typeof value === "string" ? JSON.parse(value) : value,
  z.array(objectIdSchema).min(1)
);
var validate = (schema4, values) => {
  if (!schema4) {
    return null;
  }
  const { success, error, data } = schema4.safeParse(values);
  if (!success) {
    throw new ValidationError(error);
  }
  return data;
};

// src/middlewares/authenticate.ts
import jwt from "jsonwebtoken";
import { Types as Types2 } from "mongoose";

// src/models/user.ts
import { model, MongooseError, Schema as Schema2 } from "mongoose";
import { z as z2 } from "zod";
import bcrypt from "bcrypt";

// src/schemas/image.ts
import { Schema } from "mongoose";
var imageSchema2 = new Schema(
  {
    name: {
      type: String,
      required: true
    },
    type: {
      type: String,
      required: true
    },
    size: {
      type: Number,
      required: true
    }
  },
  {
    timestamps: true
  }
);

// src/models/user.ts
var schema = new Schema2(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    firstName: {
      type: String,
      trim: true
    },
    lastName: {
      type: String,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      select: false,
      validate: {
        validator: (email) => {
          const schema4 = z2.string().email();
          const { success } = schema4.safeParse(email);
          return success;
        }
      }
    },
    image: imageSchema2,
    password: {
      type: String,
      required: true,
      select: false
    }
  },
  {
    timestamps: true
  }
);
schema.pre("save", async function(next) {
  if (!this.isModified("password")) {
    next();
    return;
  }
  try {
    const hashedPassword = await bcrypt.hash(this.password, 10);
    this.password = hashedPassword;
    next();
  } catch (error) {
    if (error instanceof MongooseError) {
      next(error);
      return;
    }
    if (error instanceof Error) {
      logger.error({
        identifier: "database_hash_password",
        message: error.message
      });
      throw error;
    }
  }
});
var User = model("User", schema);

// src/middlewares/authenticate.ts
var handleError2 = (error, shouldThrow) => {
  if (shouldThrow) {
    throw error;
  }
  return null;
};
var authenticate = async (req, shouldThrow) => {
  const authHeader = req.headers.authorization;
  const accessToken = authHeader?.split(" ")[1];
  if (!accessToken) {
    return handleError2(new AuthError("access token missing", 401), shouldThrow);
  }
  let decodedToken;
  try {
    decodedToken = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
  } catch (error) {
    const message = error instanceof Error ? error.message : "invalid access token";
    return handleError2(new AuthError(message, 401), shouldThrow);
  }
  const { success, data } = tokenSchema.safeParse(decodedToken);
  if (!success) {
    return handleError2(
      new AuthError("malformed access token", 401),
      shouldThrow
    );
  }
  if (!await User.exists({ _id: data.userId })) {
    return handleError2(new AuthError("user does not exist", 404), shouldThrow);
  }
  const userObjectId = new Types2.ObjectId(data.userId);
  return userObjectId;
};

// src/lib/file.ts
import mongoose2 from "mongoose";
var getBucketConnection = () => {
  return new mongoose2.mongo.GridFSBucket(mongoose2.connection.db, {
    bucketName: "images"
  });
};
var getFileId = (name) => {
  const id = name.split("-")[0];
  validate(objectIdSchema, id);
  return new mongoose2.Types.ObjectId(id);
};
var deleteFile = async (name) => {
  const bucket = getBucketConnection();
  const id = getFileId(name);
  await bucket.delete(id);
};

// src/lib/handler.ts
var upload = async (req) => {
  const bucket = getBucketConnection();
  const stream = async (file) => {
    const uploadStream = bucket.openUploadStream(file.originalname);
    const id = uploadStream.id;
    await new Promise((resolve, reject) => {
      uploadStream.once("finish", resolve);
      uploadStream.once("error", reject);
      uploadStream.end(file.buffer);
    });
    return {
      name: `${id.toString()}-${file.originalname}`,
      type: file.mimetype,
      size: file.size
    };
  };
  if (req.file) {
    req.body[req.file.fieldname] = await stream(req.file);
  }
  if (req.files) {
    const files = Array.isArray(req.files) ? req.files : Object.values(req.files).flat();
    for (const file of files) {
      req.body[file.fieldname] = req.body[file.fieldname] || [];
      req.body[file.fieldname].push(await stream(file));
    }
  }
};
var handle = (callback, options) => {
  return async (req, res, next) => {
    try {
      const userId = options?.authentication ? options.authentication === "required" ? await authenticate(req, true) : await authenticate(req, false) : null;
      const params = validate(options?.schemas?.params, req.params);
      const queryParams = validate(options?.schemas?.queryParams, req.query);
      if (req.file || req.files) {
        await upload(req);
      }
      const values = validate(options?.schemas?.values, req.body);
      const cookies = validate(options?.schemas?.cookies, req.cookies);
      const args = {
        req,
        params,
        queryParams,
        res,
        values,
        cookies,
        userId,
        next
      };
      await callback(args);
    } catch (error) {
      handleError({ error, res });
    }
  };
};

// src/models/refresh-token.ts
import { model as model2, Schema as Schema3 } from "mongoose";
var schema2 = new Schema3({
  token: {
    type: String,
    required: true,
    unique: true
  }
});
var RefreshToken = model2(
  "RefreshToken",
  schema2
);

// src/controller/auth.ts
var tokenResponse = async ({
  userId,
  res,
  status = 200
}) => {
  const accessToken = jwt2.sign({ userId }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "15m"
  });
  const refreshToken = jwt2.sign({ userId }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: "7d"
  });
  const databaseRefreshToken = new RefreshToken({ token: refreshToken });
  await databaseRefreshToken.save();
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production"
  });
  res.status(status).json({ accessToken });
};
var authController = {
  register: handle(
    async ({
      res,
      values: { username, firstName, lastName, email, password, image }
    }) => {
      const existingUser = await User.findOne({
        $or: [{ email }, { username }]
      });
      if (existingUser) {
        throw new HandlerError("email or username already in use", 400);
      }
      const user = new User({
        username,
        firstName,
        lastName,
        email,
        password,
        image
      });
      await user.save();
      await tokenResponse({ userId: user._id, res, status: 201 });
    },
    {
      schemas: {
        values: registerActionSchema
      }
    }
  ),
  login: handle(
    async ({ res, values: { email, username, password } }) => {
      const user = await User.findOne(
        {
          $or: [{ username }, { email }]
        },
        "+password"
      );
      if (!user || !await bcrypt2.compare(password, user.password)) {
        throw new HandlerError("wrong email, username or password", 400);
      }
      await tokenResponse({ userId: user._id, res });
    },
    {
      schemas: {
        values: loginActionSchema
      }
    }
  ),
  logout: handle(
    async ({ res, cookies: { refreshToken } }) => {
      if (!await RefreshToken.exists({ token: refreshToken })) {
        throw new AuthError("invalid or expired refresh token", 401);
      }
      await RefreshToken.findOneAndDelete({ token: refreshToken });
      res.clearCookie("refreshToken", { httpOnly: true, secure: true });
      res.status(204).send();
    },
    {
      authentication: "required",
      schemas: { cookies: z3.object({ refreshToken: z3.string() }) }
    }
  ),
  refreshToken: handle(
    async ({ res, cookies: { refreshToken } }) => {
      if (!await RefreshToken.exists({ token: refreshToken })) {
        throw new AuthError("invalid or expired refresh token", 401);
      }
      let decodedToken;
      try {
        decodedToken = jwt2.verify(
          refreshToken,
          process.env.REFRESH_TOKEN_SECRET
        );
      } catch (error) {
        const message = error instanceof Error ? error.message : "invalid refresh token";
        throw new AuthError(message, 401);
      }
      const { success, data } = tokenSchema.safeParse(decodedToken);
      if (!success) {
        throw new AuthError("malformed refresh token", 401);
      }
      await RefreshToken.findOneAndDelete({ token: refreshToken });
      await tokenResponse({ userId: data.userId, res });
    },
    { schemas: { cookies: z3.object({ refreshToken: z3.string() }) } }
  )
};

// src/controller/user.ts
import { z as z4 } from "zod";

// src/lib/only-defined-values.ts
var onlyDefinedValues = (object) => {
  Object.keys(object).forEach(
    (key) => object[key] === void 0 && delete object[key]
  );
  return object;
};

// src/controller/user.ts
var userController = {
  getUserById: handle(
    async ({ res, params: { id } }) => {
      const user = await User.findById(id);
      if (!user) {
        throw new NotFoundError("user not found");
      }
      res.status(200).json({
        _id: user._id,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName
      });
    },
    {
      schemas: {
        params: z4.object({
          id: objectIdSchema
        })
      }
    }
  ),
  getCurrentUser: handle(
    async ({ res, userId }) => {
      const user = await User.findById(userId);
      res.status(200).json({
        _id: user._id,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email
      });
    },
    { authentication: "required" }
  ),
  editUser: handle(
    async ({
      res,
      values: { username, firstName, lastName, image },
      userId
    }) => {
      const userWithWantedUsername = await User.findOne({ username });
      if (userWithWantedUsername) {
        throw new HandlerError("username taken", 400);
      }
      const user = await User.findById(userId);
      const oldImage = user.image;
      if (oldImage) {
        await deleteFile(oldImage.name);
      }
      user.set(
        onlyDefinedValues({
          username,
          firstName,
          lastName,
          image
        })
      );
      await user.save();
      res.status(204).send();
    },
    {
      authentication: "required",
      schemas: {
        values: z4.object({
          username: usernameSchema.optional(),
          firstName: z4.string().optional(),
          lastName: z4.string().optional(),
          image: imageSchema.optional()
        })
      }
    }
  ),
  deleteUser: handle(
    async ({ res, userId }) => {
      const user = await User.findById(userId);
      if (user.image) {
        await deleteFile(user.image.name);
      }
      await user.deleteOne();
      res.status(204).send();
    },
    { authentication: "required" }
  )
};

// src/controller/capsule.ts
import { z as z5 } from "zod";

// src/models/capsule.ts
import { model as model3, Schema as Schema4 } from "mongoose";
var schema3 = new Schema4(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    sealedAt: {
      type: Date
    },
    openDate: {
      type: Date
    },
    showCountdown: {
      type: Boolean,
      required: true,
      default: false
    },
    visibility: {
      type: String,
      enum: ["public", "private"],
      required: true
    },
    content: {
      type: String
    },
    images: [imageSchema2],
    senders: [
      {
        type: Schema4.Types.ObjectId,
        ref: "User"
      }
    ],
    receivers: [
      {
        type: Schema4.Types.ObjectId,
        ref: "User"
      }
    ]
  },
  {
    timestamps: true
  }
);
schema3.virtual("state").get(function() {
  if (!this.openDate) return "unsealed";
  if (this.openDate && this.openDate >= /* @__PURE__ */ new Date()) return "sealed";
  if (this.openDate && this.openDate <= /* @__PURE__ */ new Date()) return "opened";
});
schema3.method("isSentBy", function(userId) {
  if (!userId) return false;
  return this.senders.some(
    (sender) => sender._id.toString() === userId.toString()
  );
});
schema3.method("isReceivedBy", function(userId) {
  if (!userId) return false;
  return this.receivers.some(
    (receiver) => receiver._id.toString() === userId.toString()
  );
});
schema3.pre("save", function(next) {
  if (!this.isModified("openDate")) {
    next();
    return;
  }
  this.sealedAt = /* @__PURE__ */ new Date();
  next();
});
var Capsule = model3("Capsule", schema3);

// src/controller/capsule.ts
import { capsuleResponseSchema } from "@repo/validation";
var filterCapsuleResponse = (capsule) => {
  const {
    _id,
    state,
    visibility,
    senders,
    receivers,
    showCountdown,
    title,
    content,
    images,
    openDate,
    sealedAt
  } = capsule;
  const { error, data } = capsuleResponseSchema.safeParse({
    _id,
    state,
    visibility,
    senders,
    receivers,
    showCountdown,
    title,
    content,
    images: images.map((image) => ({
      name: image.name,
      type: image.type
    })),
    openDate,
    sealedAt
  });
  if (error) {
    throw new ValidationError(error);
  }
  return data;
};
var getCapsules = async ({
  filters,
  queryParams
}) => {
  const filter = filters[queryParams?.type || "default"];
  const limit = queryParams?.take || 10;
  const skip = queryParams?.skip || 0;
  const lookupUsers = (field) => {
    return {
      from: "users",
      localField: field,
      foreignField: "_id",
      pipeline: [
        {
          $project: {
            image: 1,
            username: 1,
            firstName: 1,
            lastName: 1
          }
        }
      ],
      as: field
    };
  };
  return await Capsule.aggregate([
    {
      $addFields: {
        state: {
          $switch: {
            branches: [
              {
                case: { $not: ["$openDate"] },
                then: "unsealed"
              },
              {
                case: { $gte: ["$openDate", "$$NOW"] },
                then: "sealed"
              },
              {
                case: { $lte: ["$openDate", "$$NOW"] },
                then: "opened"
              }
            ]
          }
        },
        openDateDiff: {
          $divide: [
            { $subtract: ["$openDate", "$$NOW"] },
            1e3 * 60 * 60 * 24
            // convert milliseconds to days
          ]
        },
        hasOpenDate: {
          $cond: { if: { $gt: ["$openDate", null] }, then: 1, else: 0 }
        }
      }
    },
    { $match: filter },
    {
      $sort: {
        hasOpenDate: -1,
        // prioritize capsules with an open date
        openDateDiff: 1,
        sealedAt: -1,
        createdAt: -1
      }
    },
    {
      $skip: skip
    },
    {
      $limit: limit
    },
    {
      $lookup: lookupUsers("senders")
    },
    {
      $lookup: lookupUsers("receivers")
    }
  ]);
};
var capsuleController = {
  createCapsule: handle(
    async ({ res, values: { collaborators, ...rest }, userId }) => {
      const capsule = new Capsule({
        senders: [userId, ...collaborators || []],
        ...rest
      });
      await capsule.save();
      res.status(201).json({ id: capsule._id });
    },
    {
      authentication: "required",
      schemas: {
        values: z5.object({
          title: z5.string().min(1),
          openDate: z5.string().datetime().optional(),
          showCountdown: multipartFormBoolean.optional(),
          visibility: z5.enum(["public", "private"]),
          content: z5.string().optional(),
          images: z5.array(imageSchema).min(1).optional(),
          collaborators: multipartFormObjectIdArray.optional(),
          receivers: multipartFormObjectIdArray.optional()
        })
      }
    }
  ),
  editCapsule: handle(
    async ({
      res,
      params: { id },
      values: { collaborators, ...rest },
      userId
    }) => {
      const capsule = await Capsule.findById(id);
      if (!capsule) {
        throw new NotFoundError("capsule not found");
      }
      if (!capsule.isSentBy(userId)) {
        throw new AuthError("you are not allowed to edit this capsule", 403);
      }
      if (!(capsule.state === "unsealed")) {
        throw new HandlerError("capsule is sealed and can not be edited", 423);
      }
      capsule.set(
        onlyDefinedValues({
          senders: [userId, ...collaborators || []],
          ...rest
        })
      );
      await capsule.save();
      res.status(204).send();
    },
    {
      authentication: "required",
      schemas: {
        params: z5.object({ id: objectIdSchema }),
        values: z5.object({
          title: z5.string().min(1).optional(),
          openDate: z5.string().datetime().optional(),
          showCountdown: multipartFormBoolean.optional(),
          visibility: z5.enum(["public", "private"]).optional(),
          content: z5.string().optional(),
          images: z5.array(imageSchema).min(1).optional(),
          collaborators: multipartFormObjectIdArray.optional(),
          receivers: multipartFormObjectIdArray.optional()
        })
      }
    }
  ),
  deleteCapsule: handle(
    async ({ res, params: { id }, userId }) => {
      const capsule = await Capsule.findById(id);
      if (!capsule) {
        throw new NotFoundError("capsule not found");
      }
      if (!capsule.isSentBy(userId)) {
        throw new AuthError("you are not allowed to delete this capsule", 403);
      }
      await capsule.deleteOne();
      res.status(204).send();
    },
    {
      authentication: "required",
      schemas: { params: z5.object({ id: objectIdSchema }) }
    }
  ),
  getCapsuleById: handle(
    async ({ res, params: { id }, userId }) => {
      const capsule = await Capsule.findById(id).populate(
        "senders",
        "image username firstName lastName"
      );
      if (!capsule) {
        throw new NotFoundError("capsule not found");
      }
      const { showCountdown, visibility, state } = capsule;
      switch (state) {
        case "unsealed":
          if (!userId || !capsule.isSentBy(userId)) {
            throw new HandlerError(
              "you are not allowed to access this capsule",
              403
            );
          }
          res.status(200).json(filterCapsuleResponse(capsule));
          return;
        case "sealed":
          if (visibility === "private" && (!userId || !capsule.isSentBy(userId))) {
            throw new HandlerError(
              "you are not allowed to access this capsule",
              403
            );
          }
          if (visibility === "public" && (!userId || !capsule.isSentBy(userId)) && !showCountdown) {
            throw new HandlerError(
              "capsule is sealed and cannot be opened yet",
              423
            );
          }
          res.status(200).json(filterCapsuleResponse(capsule));
          return;
        case "opened":
          if (visibility === "private" && (!userId || !capsule.isSentBy(userId) && !capsule.isReceivedBy(userId))) {
            throw new HandlerError(
              "you are not allowed to access this capsule",
              403
            );
          }
          res.status(200).json(filterCapsuleResponse(capsule));
          return;
      }
    },
    {
      authentication: "optional",
      schemas: { params: z5.object({ id: objectIdSchema }) }
    }
  ),
  getUserCapsules: handle(
    async ({ res, queryParams, userId }) => {
      const draftFilter = {
        senders: { $in: [userId] },
        state: "unsealed"
      };
      const sentFilter = {
        senders: { $in: [userId] }
      };
      const receivedFilter = {
        receivers: { $in: [userId] },
        state: "opened"
      };
      const filters = {
        default: {
          $or: [sentFilter, receivedFilter, draftFilter]
        },
        draft: draftFilter,
        sent: sentFilter,
        received: receivedFilter
      };
      const capsules = await getCapsules({ filters, queryParams });
      res.status(200).json(capsules.map((capsule) => filterCapsuleResponse(capsule)));
    },
    {
      authentication: "required",
      schemas: {
        queryParams: z5.object({
          type: z5.enum(["draft", "sent", "received"]).optional(),
          take: z5.coerce.number().min(1).optional(),
          skip: z5.coerce.number().min(1).optional()
        }).optional()
      }
    }
  ),
  getPublicCapsules: handle(
    async ({ res, queryParams }) => {
      const sealedFilter = {
        visibility: "public",
        state: "sealed",
        showCountdown: true
      };
      const openedFilter = {
        visibility: "public",
        state: "opened"
      };
      const filters = {
        default: {
          $or: [sealedFilter, openedFilter]
        },
        sealed: sealedFilter,
        opened: openedFilter
      };
      const capsules = await getCapsules({ filters, queryParams });
      res.status(200).json(capsules.map((capsule) => filterCapsuleResponse(capsule)));
    },
    {
      schemas: {
        queryParams: z5.object({
          type: z5.enum(["sealed", "opened"]).optional(),
          take: z5.coerce.number().min(1).optional(),
          skip: z5.coerce.number().min(1).optional()
        }).optional()
      }
    }
  )
};

// src/controller/image.ts
import { z as z6 } from "zod";
var imageResponse = async ({
  res,
  name,
  type
}) => {
  const bucket = getBucketConnection();
  const id = getFileId(name);
  const downloadStream = bucket.openDownloadStream(id);
  res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
  res.set("Content-Type", type);
  downloadStream.on("data", (chunk) => {
    res.write(chunk);
  });
  downloadStream.on("error", () => {
    res.status(404).end();
  });
  downloadStream.on("end", () => {
    res.end();
  });
};
var imageController = {
  getUserImageById: handle(
    async ({ res, params: { id } }) => {
      const user = await User.findById(id).populate("image");
      if (!user) {
        throw new NotFoundError("user not found");
      }
      const metadata = user.image;
      if (!metadata) {
        throw new NotFoundError("image not found");
      }
      await imageResponse({ res, name: metadata.name, type: metadata.type });
    },
    {
      schemas: { params: z6.object({ id: objectIdSchema }) }
    }
  ),
  getCurrentUserImage: handle(
    async ({ res, userId }) => {
      const metadata = (await User.findById(userId).populate("image")).image;
      if (!metadata) {
        throw new NotFoundError("image not found");
      }
      await imageResponse({ res, name: metadata.name, type: metadata.type });
    },
    {
      authentication: "required"
    }
  ),
  getCapsuleImageByName: handle(
    async ({ res, params: { id, name }, userId }) => {
      const capsule = await Capsule.findById(id);
      if (!capsule) {
        throw new NotFoundError("capsule not found");
      }
      const { visibility, state } = capsule;
      const metadata = capsule.images?.find((image) => image.name === name);
      if (!metadata) {
        throw new NotFoundError("image not found");
      }
      switch (state) {
        case "unsealed":
          if (!userId || !capsule.isSentBy(userId)) {
            throw new HandlerError(
              "you are not allowed to access this image",
              403
            );
          }
          await imageResponse({ res, name: metadata.name, type: metadata.type });
          return;
        case "sealed":
          throw new HandlerError(
            "capsule is sealed, image cannot be accessed",
            423
          );
        case "opened":
          if (visibility === "private" && (!userId || !capsule.isSentBy(userId) && !capsule.isReceivedBy(userId))) {
            throw new HandlerError(
              "you are not allowed to access this image",
              403
            );
          }
          await imageResponse({ res, name: metadata.name, type: metadata.type });
      }
    },
    {
      authentication: "optional",
      schemas: {
        params: z6.object({
          id: objectIdSchema,
          name: z6.string()
        })
      }
    }
  )
};

// src/routes.ts
var upload2 = multer();
var router = Router();
var authRouter = Router();
authRouter.post("/register", upload2.single("image"), authController.register);
authRouter.post("/log-in", authController.login);
authRouter.delete("/log-out", authController.logout);
authRouter.post("/token/refresh", authController.refreshToken);
router.use("/auth", authRouter);
var capsuleRouter = Router();
capsuleRouter.post("/", upload2.array("images"), capsuleController.createCapsule);
capsuleRouter.get("/me", capsuleController.getUserCapsules);
capsuleRouter.get("/public", capsuleController.getPublicCapsules);
capsuleRouter.get("/:id", capsuleController.getCapsuleById);
capsuleRouter.get("/:id/images/:name", imageController.getCapsuleImageByName);
capsuleRouter.put("/:id", upload2.array("images"), capsuleController.editCapsule);
capsuleRouter.delete("/:id", capsuleController.deleteCapsule);
router.use("/capsules", capsuleRouter);
var userRouter = Router();
userRouter.get("/me", userController.getCurrentUser);
userRouter.get("/me/image", imageController.getCurrentUserImage);
userRouter.put("/me", upload2.single("image"), userController.editUser);
userRouter.delete("/me", userController.deleteUser);
userRouter.get("/:id", userController.getUserById);
userRouter.get("/:id/image", imageController.getUserImageById);
router.use("/users", userRouter);

// src/index.ts
var app = express();
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true
  })
);
app.use(helmet());
app.use(express.json());
app.use(cookieParser());
app.use(router);
db.connect().then(() => {
  app.listen(process.env.PORT, () => {
    logger.information({
      identifier: "server_start",
      message: `server ready on port ${process.env.PORT}`
    });
  });
});
var index_default = app;
export {
  index_default as default
};
