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

