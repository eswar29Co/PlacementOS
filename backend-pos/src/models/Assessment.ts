import mongoose, { Schema, Document } from 'mongoose';
import { IAssessment } from '../types';

export interface IAssessmentDocument extends Omit<IAssessment, '_id'>, Document { }

const mcqQuestionSchema = new Schema({
  id: { type: String, required: true },
  question: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctOption: { type: Number, required: true },
}, { _id: false });

const codingQuestionSchema = new Schema({
  id: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  examples: [{
    input: { type: String, required: true },
    output: { type: String, required: true }
  }],
  constraints: [{ type: String }],
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    required: true
  },
  testCases: [{
    input: { type: String, required: true },
    expectedOutput: { type: String, required: true }
  }],
}, { _id: false });

const assessmentSchema = new Schema<IAssessmentDocument>(
  {
    applicationId: {
      type: Schema.Types.ObjectId as any,
      ref: 'Application',
      required: true,
      unique: true
    },
    jobId: {
      type: Schema.Types.ObjectId as any,
      ref: 'Job',
      required: true,
      index: true
    },
    deadline: { type: Date, required: true },
    duration: { type: Number, required: true }, // in minutes
    mcqQuestions: [mcqQuestionSchema],
    codingQuestion: { type: codingQuestionSchema, required: true },
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'completed'],
      default: 'pending'
    },
    score: { type: Number, min: 0, max: 100 },
    startedAt: { type: Date },
    completedAt: { type: Date },
    answers: {
      mcqAnswers: [{ type: Number }],
      codingAnswer: { type: String }
    }
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (_, ret: any) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        // Hide correct answers if assessment is not completed
        if (ret.status !== 'completed') {
          ret.mcqQuestions = ret.mcqQuestions?.map((q: any) => {
            const { correctOption, ...rest } = q;
            return rest;
          });
        }
        return ret;
      }
    }
  }
);

// Index
assessmentSchema.index({ status: 1 });
assessmentSchema.index({ deadline: 1 });

export const Assessment = mongoose.model<IAssessmentDocument>('Assessment', assessmentSchema);
