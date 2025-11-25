import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Roulette from '@/models/Roulette';

export async function GET() {
  try {
    await connectDB();
    const roulettes = await Roulette.find({}, 'roulette_name roulette_number').sort({ roulette_number: 1 });
    return NextResponse.json({ success: true, data: roulettes });
  } catch (error) {
    console.error('Error fetching roulettes:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch roulettes' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    
    const { roulette_number, roulette_name, roulette_data_count, roulette_inner_data } = body;
    
    // 중복 확인
    const existing = await Roulette.findOne({ roulette_number });
    if (existing) {
      return NextResponse.json(
        { success: false, error: 'Roulette number already exists' },
        { status: 400 }
      );
    }
    
    // 새 룰렛 생성 (roulette_user_data는 빈 배열로 초기화)
    const newRoulette = new Roulette({
      roulette_number,
      roulette_name,
      roulette_data_count,
      roulette_inner_data,
      roulette_user_data: [],
    });
    
    await newRoulette.save();
    
    return NextResponse.json({ success: true, data: newRoulette }, { status: 201 });
  } catch (error) {
    console.error('Error creating roulette:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create roulette' },
      { status: 500 }
    );
  }
}

