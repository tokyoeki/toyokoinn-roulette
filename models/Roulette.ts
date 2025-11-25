import mongoose, { Schema, Document } from 'mongoose';

export interface IRoulette extends Document {
  roulette_number: number;
  roulette_name: string;
  roulette_data_count: number;
  roulette_inner_data: string[];
  roulette_user_data: string[];
}

const RouletteSchema: Schema = new Schema({
  roulette_number: {
    type: Number,
    required: true,
  },
  roulette_name: {
    type: String,
    required: true,
  },
  roulette_data_count: {
    type: Number,
    required: true,
  },
  roulette_inner_data: {
    type: [String],
    required: true,
  },
  roulette_user_data: {
    type: [String],
    required: true,
  },
});

export default mongoose.models.Roulette || mongoose.model<IRoulette>('Roulette', RouletteSchema);

