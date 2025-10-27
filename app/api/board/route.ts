import { NextRequest, NextResponse } from "next/server";
import {
  boardService,
} from "../../../lib/services";
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");
    switch (type) {
      case "boards":
        const userId = searchParams.get("userid");
        if (!userId) {
          return new NextResponse("Missing user id parameter", { status: 400 });
        }
        const data = await boardService.getBoards(userId);
        
        break;
      case "board":
        break;
    }
  } catch (err) {
    return new NextResponse("Internal Error", { status: 500 });
  }
}
