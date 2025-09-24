import { NextRequest, NextResponse } from "next/server";


export async function GET(req : NextRequest) {
    try{
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get("userid");
        if(!userId){
            return new NextResponse('Missing user id parameter',{status:400});
        }
        
    }catch(err){
        return new NextResponse('Internal Error', { status: 500 });
    }
}