import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const tenantHeader = request.headers.get('X-Tenant');
    
    if (!tenantHeader) {
      return NextResponse.json(
        { error: true, message: 'X-Tenant header is required' },
        { status: 400 }
      );
    }

    // Forward the request to the actual API
    const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://api.atomsuit.test/api';
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'X-Tenant': tenantHeader,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    return NextResponse.json(data, { 
      status: response.status,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-Tenant',
      }
    });

  } catch {
    return NextResponse.json(
      { error: true, message: 'Proxy request failed' },
      { status: 500 }
    );
  }
}

// Handle preflight OPTIONS requests
export async function OPTIONS() {
  return NextResponse.json({}, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-Tenant',
    }
  });
}