import BoardModel from "../models/Board.model.js";
import ProjectModel from "../models/Project.model.js";
import TaskModel from "../models/Task.model.js";
import TemplateModel from "../models/Template.model.js";

export async function saveTemplate(req, res, next) {
  try {
    const authUser = res.locals.user;
    const { name, description, projectId } = req.body;

    // Check if the required fields are provided
    if (!name || !projectId) {
      return res.status(400).send({
        success: false,
        message: "Paramètres manquants",
      });
    }

    const newTemplate = new TemplateModel({
      name: name,
      description: description,
      author: authUser?._id,
      project: projectId,
    });

    const savedTemplate = await newTemplate.save();

    return res.status(201).send({
      success: true,
      message: "Modèle de projet enregistré avec succès",
      data: savedTemplate,
    });
  } catch (err) {
    return res.status(500).send({
      success: false,
      message:
        err?.message ||
        "Une erreur s'est produite lors de l'enregistrement du modèle",
    });
  }
}

export async function useTemplate(req, res, next) {
  try {
    const authUser = res.locals.user;

    const template = await TemplateModel.findById({
      _id: req.params.id,
    })
      .populate("project")
      .exec();

    if (!template) {
      return res.status(404).send({
        success: false,
        message: "Modèle non trouvé",
      });
    }

    // First we need to get the project that the template is based on
    const project = await ProjectModel.findById({
      _id: template?.project?._id,
    });

    // Then we need to create a new project with the same structure as the template
    const newProject = new ProjectModel({
      members: [
        {
          user: authUser?._id,
          role: "owner",
        },
      ],
      name: template?.name,
      note: project?.note,
    });

    await newProject.save();

    // Then we need to create the boards and tasks for the new project
    const boards = await BoardModel.find({ projectId: project?._id });

    // For each board, we need to create a new board with the same structure
    boards.forEach(async (board) => {
      const newBoard = new BoardModel({
        projectId: newProject?._id,
        title: board?.title,
        color: board?.color,
      });

      await newBoard.save();

      // Then we need to create the tasks for the new board
      const tasks = await TaskModel.find({ boardId: board?._id });

      //  For each task, we need to create a new task with the same structure
      tasks.forEach(async (task) => {
        const newTask = new TaskModel({
          projectId: newProject?._id,
          boardId: newBoard?._id,
          author: authUser?._id,
          text: task?.text,
        });

        await newTask.save();
      });
    });

    return res.status(201).send({
      success: true,
      message: "Modèle utilisé avec succès",
      data: newProject,
    });
  } catch (err) {
    return res.status(500).send({
      success: false,
      message:
        err?.message ||
        "Une erreur s'est produite lors de l'utilisation du modèle",
    });
  }
}

export async function useBoardTemplate(req, res, next) {
  try {
    const authUser = res.locals.user;
    const { projectId } = req.body;

    const template = await TemplateModel.findById({
      _id: req.params.id,
    })
      .populate("board")
      .exec();

    if (!template) {
      return res.status(404).send({
        success: false,
        message: "Modèle non trouvé",
      });
    }

    const board = await BoardModel.findById({ _id: template?.board?._id });

    if (!board) {
      return res.status(404).send({
        success: false,
        message: "Tableau non trouvé",
      });
    }

    const newBoard = new BoardModel({
      projectId: projectId,
      title: board?.title,
      color: board?.color,
    });

    const savedBoard = await newBoard.save();

    const tasks = await TaskModel.find({ boardId: board?._id });

    tasks.forEach(async (task) => {
      const newTask = new TaskModel({
        projectId: projectId?._id,
        boardId: savedBoard?._id,
        author: authUser?._id,
        text: task?.text,
      });

      await newTask.save();
    });
  } catch (err) {
    return res.status(500).send({
      success: false,
      message:
        err?.message ||
        "Une erreur s'est produite lors de l'utilisation du modèle",
    });
  }
}

export async function getTemplates(req, res, next) {
  try {
    const templates = await TemplateModel.aggregate([
      {
        $lookup: {
          from: "boards",
          localField: "project",
          foreignField: "projectId",
          as: "boards",
        },
      },
      {
        $lookup: {
          from: "tasks",
          localField: "project",
          foreignField: "projectId",
          as: "tasks",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "author",
          foreignField: "_id",
          as: "creator",
        },
      },
      {
        $addFields: {
          boardsCount: { $size: "$boards" },
          tasksCount: { $size: "$tasks" },
          creator: { $arrayElemAt: ["$creator", 0] },
          // Grouper les tâches par board
          boardsWithTasks: {
            $map: {
              input: "$boards",
              as: "board",
              in: {
                _id: "$$board._id",
                title: "$$board.title",
                color: "$$board.color",
                tasks: {
                  $filter: {
                    input: "$tasks",
                    as: "task",
                    cond: { $eq: ["$$task.boardId", "$$board._id"] }
                  }
                }
              }
            }
          }
        },
      },
      {
        $project: {
          name: 1,
          description: 1,
          author: 1,
          project: 1,
          createdAt: 1,
          updatedAt: 1,
          boardsCount: 1,
          tasksCount: 1,
          boardsWithTasks: 1,
          "creator.name": 1,
          "creator.picture": 1
        },
      },
    ]);

    if (templates.length === 0) {
      return res.status(404).send({
        success: false,
        message: "Aucun modèle trouvé",
      });
    }

    return res.status(200).send({
      success: true,
      message: "Modèles récupérés avec succès",
      data: templates,
    });
  } catch (err) {
    return res.status(500).send({
      success: false,
      message:
        err?.message ||
        "Une erreur s'est produite lors de la récupération des modèles",
    });
  }
}

export async function updateTemplate(req, res, next) {
  try {
    const { name, description } = req.body;

    if (!name || !description) {
      return res.status(400).send({
        success: false,
        message: "Paramètres manquants",
      });
    }

    const updatedTemplate = await TemplateModel.findByIdAndUpdate(
      { _id: req.params.id },
      {
        name: name,
        description: description,
      },
      { new: true, setDefaultsOnInsert: true }
    );

    if (!updatedTemplate) {
      return res.status(404).send({
        success: false,
        message: "Impossible de metttre à jour un modèle inexistant",
      });
    }

    return res.status(200).send({
      success: true,
      message: "Modèle mis à jour avec succès",
      data: updatedTemplate,
    });
  } catch (err) {
    return res.status(500).send({
      success: false,
      message:
        err?.message ||
        "Une erreur s'est produite lors de la mise à jour du modèle",
    });
  }
}

export async function deleteTemplate(req, res, next) {
  try {
    const template = await TemplateModel.findByIdAndDelete({
      _id: req.params.id,
    });

    if (!template) {
      return res.status(404).send({
        success: false,
        message: "Modèle non trouvé",
      });
    }

    return res.status(200).send({
      success: true,
      message: "Modèle supprimé avec succès",
    });
  } catch (err) {
    return res.status(500).send({
      success: false,
      message:
        err?.message ||
        "Une erreur s'est produite lors de la suppression du modèle",
    });
  }
}

export async function useCustomTemplate(req, res, next) {
  try {
    const authUser = res.locals.user;
    const { projectName, boards } = req.body;

    if (!projectName || !boards || !Array.isArray(boards)) {
      return res.status(400).send({
        success: false,
        message: "Paramètres manquants (projectName et boards requis)",
      });
    }

    // Create a new project with the custom name
    const newProject = new ProjectModel({
      members: [
        {
          user: authUser?._id,
          role: "owner",
        },
      ],
      name: projectName,
    });

    await newProject.save();

    // Create boards and tasks based on the custom data
    for (const boardData of boards) {
      const newBoard = new BoardModel({
        projectId: newProject?._id,
        title: boardData.title,
        color: boardData.color || "#3B82F6", // Default color
      });

      await newBoard.save();

      // Create tasks for this board
      if (boardData.tasks && Array.isArray(boardData.tasks)) {
        for (const taskData of boardData.tasks) {
          const newTask = new TaskModel({
            projectId: newProject?._id,
            boardId: newBoard?._id,
            author: authUser?._id,
            text: taskData.text,
          });

          await newTask.save();
        }
      }
    }

    return res.status(201).send({
      success: true,
      message: "Projet créé avec succès à partir du modèle personnalisé",
      data: newProject,
    });
  } catch (err) {
    return res.status(500).send({
      success: false,
      message:
        err?.message ||
        "Une erreur s'est produite lors de la création du projet",
    });
  }
}
