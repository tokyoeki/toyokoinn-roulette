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

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await request.json();
    
    const { roulette_name, roulette_data_count, roulette_inner_data } = body;
    
    // 기존 룰렛 찾기
    const roulette = await Roulette.findOne({ roulette_number: parseInt(id) });
    
    if (!roulette) {
      return NextResponse.json(
        { success: false, error: 'Roulette not found' },
        { status: 404 }
      );
    }
    
    // 업데이트 (roulette_user_data와 GuaranteedWin은 유지)
    roulette.roulette_name = roulette_name;
    roulette.roulette_data_count = roulette_data_count;
    roulette.roulette_inner_data = roulette_inner_data;
    
    await roulette.save();
    
    return NextResponse.json({ success: true, data: roulette });
  } catch (error) {
    console.error('Error updating roulette:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update roulette' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    
    const roulette = await Roulette.findOneAndDelete({ roulette_number: parseInt(id) });
    
    if (!roulette) {
      return NextResponse.json(
        { success: false, error: 'Roulette not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, message: 'Roulette deleted' });
  } catch (error) {
    console.error('Error deleting roulette:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete roulette' },
      { status: 500 }
    );
  }
}

