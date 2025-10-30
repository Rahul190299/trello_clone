import { NextRequest, NextResponse } from "next/server";
import { currentProfile } from "@/lib/current-profile";
import { boardService, columnService } from "../../../lib/services";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const profile = await currentProfile();
    if (!profile) {
      return new NextResponse("Missing profile cookie", { status: 400 });
    }
    const boardId = searchParams.get("boardid");
    if (!boardId) {
      return new NextResponse("Missing board id", { status: 400 });
    }
    const columns = await columnService.getColumns(boardId);
    return NextResponse.json(columns, { status: 200 });
  } catch (err) {
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const profile = await currentProfile();
    if (!profile) {
      return new NextResponse("Missing profile cookie", { status: 400 });
    }
    const body = await request.json();
    const { title, board_id, sort_order } = body; // example fields
    const newColumn = await columnService.createColumn({ title, board_id, sort_order,user_id: profile.id });

    return NextResponse.json(newColumn, { status: 201 });
  } catch (error: any) {
    console.error("Error creating column:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const profile = await currentProfile();
    if (!profile) {
      return new NextResponse("Missing profile cookie", { status: 400 });
    }
    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Missing column id" }, { status: 400 });
    }

    const body = await request.json();
    const { title } = body;

    const updatedColumn = await columnService.updateColumnTitle(id, title);
    return NextResponse.json(updatedColumn, { status: 200 });
  } catch (error: any) {
    console.error("Error updating column:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
