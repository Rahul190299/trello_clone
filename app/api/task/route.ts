import { NextResponse } from "next/server";
import { taskService } from "../../../lib/services";
import { currentProfile } from "@/lib/current-profile";
// GET /api/tasks?boardId=123
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const boardId = searchParams.get("boardId");
  const profile = await currentProfile();
  if (!profile) {
    return new NextResponse("Missing profile cookie", { status: 400 });
  }
  if (!boardId) {
    return NextResponse.json({ error: "Missing boardId" }, { status: 400 });
  }

  try {
    const tasks = await taskService.getTasksByBoard(boardId);
    return NextResponse.json(tasks);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch tasks" },
      { status: 500 }
    );
  }
}

// POST /api/tasks
export async function POST(request: Request) {
  try {
    const profile = await currentProfile();
    if (!profile) {
      return new NextResponse("Missing profile cookie", { status: 400 });
    }
    const body = await request.json();
    const newTask = await taskService.createTask(body);
    return NextResponse.json(newTask, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to create task" },
      { status: 500 }
    );
  }
}
