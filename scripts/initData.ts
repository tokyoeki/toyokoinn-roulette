import mongoose from 'mongoose';
import Roulette from '../models/Roulette';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(__dirname, '../.env.local') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://DODO:dodo123@dodo.ly18ypw.mongodb.net/db?retryWrites=true&w=majority';

async function initData() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB 연결 성공');

    // 기존 데이터 확인
    const existing = await Roulette.findOne({ roulette_number: 1 });
    if (existing) {
      console.log('초기 데이터가 이미 존재합니다.');
      await mongoose.disconnect();
      return;
    }

    // 초기 데이터 삽입
    const initialData = {
      roulette_number: 1,
      roulette_name: '과일',
      roulette_data_count: 4,
      roulette_inner_data: ['사과', '귤', '복숭아', '수박'],
    };

    await Roulette.create(initialData);
    console.log('초기 데이터 삽입 완료:', initialData);

    await mongoose.disconnect();
    console.log('MongoDB 연결 종료');
  } catch (error) {
    console.error('오류 발생:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

initData();

