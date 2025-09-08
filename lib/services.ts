import { Board, Column, Task } from "../lib/models/models";
import { db } from "./db";

export const boardService = {
  async getBoard(boardId: string): Promise<Board> {
    const board = await db.board.findUnique({
      where: {
        id: boardId,
      },
    });

    if (!board) {
      throw new Error("Board not found");
    }

    return board;
  },

  async getBoards(userId: string): Promise<Board[]> {
    // const { data, error } = await supabase
    //   .from("boards")
    //   .select("*")
    //   .eq("user_id", userId)
    //   .order("created_at", { ascending: false });
    let boards: Board[] = [];
    try {
      boards = await db.board.findMany({
        where: {
          user_id: userId,
        },
        orderBy: {
          created_at: "desc",
        },
      });
    } catch (err) {}

    return boards || [];
  },

  async createBoard(
    board: Omit<Board, "id" | "created_at" | "updated_at">
  ): Promise<Board> {
    const newBoard = await db.board.create({
      data: board,
    });

    return newBoard;
  },

  async updateBoard(boardId: string, updates: Partial<Board>): Promise<Board> {
    const updatedBoard = await db.board.update({
      where: {
        id: boardId,
      },
      data: {
        ...updates,
        updated_at: new Date(), // ensure updated_at is refreshed
      },
    });

    return updatedBoard;
  },
};

export const columnService = {
  async getColumns(boardId: string): Promise<Column[]> {
    const columns = await db.column.findMany({
      where: {
        board_id: boardId,
      },
      orderBy: {
        sort_order: "asc",
      },
    });

    return columns;
  },

  async createColumn(
    column: Omit<Column, "id" | "created_at">
  ): Promise<Column> {
    const newColumn = await db.column.create({
      data: column,
    });

    return newColumn;
  },

  async updateColumnTitle(columnId: string, title: string): Promise<Column> {
    const updatedColumn = await db.column.update({
      where: {
        id: columnId,
      },
      data: {
        title,
      },
    });

    return updatedColumn;
  },
};

export const taskService = {
  async getTasksByBoard(boardId: string): Promise<Task[]> {
    const tasks = await db.task.findMany({
      where: {
        column: {
          board_id: boardId, // filter by related column's board_id
        },
      },
      orderBy: {
        sort_order: "asc",
      },
      include: {
        column: true, // equivalent to Supabase `columns!inner(board_id)`
      },
    });

    return tasks;
  },

  async createTask(
    task: Omit<Task, "id" | "created_at" | "updated_at">
  ): Promise<Task> {
    const newTask = await db.task.create({
      data: {
        title: task.title,
        description: task.description,
        column_id: task.column_id,
        sort_order: task.sort_order,
        priority : task.priority
      },
    });
    

    return newTask;
  },

  async moveTask(
    taskId: string,
    newColumnId: string,
    newOrder: number
  ): Promise<Task> {
    const updatedTask = await db.task.update({
      where: {
        id: taskId,
      },
      data: {
        column_id: newColumnId,
        sort_order: newOrder,
      },
    });

    return updatedTask;
  },
};

export const boardDataService = {
  async getBoardWithColumns(boardId: string) {
    const [board, columns] = await Promise.all([
      boardService.getBoard(boardId),
      columnService.getColumns(boardId),
    ]);

    if (!board) throw new Error("Board not found");

    const tasks = await taskService.getTasksByBoard(boardId);

    const columnsWithTasks = columns.map((column) => ({
      ...column,
      tasks: tasks.filter((task) => task.column_id === column.id),
    }));

    return {
      board,
      columnsWithTasks,
    };
  },

  async createBoardWithDefaultColumns(boardData: {
    title: string;
    description?: string;
    color?: string;
    userId: string;
  }) {
    return await db.$transaction(async (tx) => {
      // Create the board
      const board = await tx.board.create({
        data: {
          title: boardData.title,
          description: boardData.description || null,
          color: boardData.color || "bg-blue-500",
          user_id: boardData.userId,
        },
      });

      // Default columns
      const defaultColumns = [
        { title: "To Do", sort_order: 0 },
        { title: "In Progress", sort_order: 1 },
        { title: "Review", sort_order: 2 },
        { title: "Done", sort_order: 3 },
      ];

      // Create all default columns for the new board
      await tx.column.createMany({
        data: defaultColumns.map((col) => ({
          ...col,
          board_id: board.id,
          user_id: boardData.userId,
        })),
      });

      return board;
    });
  },
};
