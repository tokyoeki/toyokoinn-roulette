import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Roulette from '@/models/Roulette';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const roulette = await Roulette.findOne({ roulette_number: parseInt(id) });
    
    if (!roulette) {
      return NextResponse.json(
        { success: false, error: 'Roulette not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: roulette });
  } catch (error) {
    console.error('Error fetching roulette:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch roulette' },
      { status: 500 }
    );
  }
}

