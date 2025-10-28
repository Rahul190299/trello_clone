import { NextRequest, NextResponse } from "next/server";
import { currentProfile } from "@/lib/current-profile";
import { boardService } from "../../../lib/services";
import { ca } from "zod/v4/locales";
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");
    const profile = await currentProfile();
    if (!profile) {
      return new NextResponse("Missing profile cookie", { status: 400 });
    }
    switch (type) {
      case "boards":
        const boards = await boardService.getBoards(profile.id);
        return NextResponse.json(boards, { status: 200 });
      case "board":
        const boardId = searchParams.get('boardid');
        if(!boardId){
          return new NextResponse("Missing board id", { status: 400 });
        }
        const board = await boardService.getBoard(boardId);
        return NextResponse.json(board, { status: 200 });
    }
  } catch (err) {
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(request : NextRequest) {
  try{
    const body = await request.json(); // Parse the incoming JSON body
    await boardService.createBoard(body);
  }catch(err){
    return new NextResponse("Internal Error", { status: 500 });
  }
}
