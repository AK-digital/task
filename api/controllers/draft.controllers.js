import DraftModel from "../models/Draft.model.js";
import ProjectModel from "../models/Project.model.js";
import TaskModel from "../models/Task.model.js";

export async function saveDraft(req, res) {
  try {
    const authUser = res.locals.user;
    const { projectId } = req.query;
    const { type, taskId, content } = req.body;

    if (!type || !projectId || !taskId || !content) {
      return res.status(400).send({
        success: false,
        message: "Missing required parameters",
      });
    }

    if (type !== "message" && type !== "description") {
      return res.status(400).send({
        success: false,
        message: "Invalid parameter. Must be 'message' or 'description'",
      });
    }

    const [project, task] = await Promise.all([
      ProjectModel.exists({ _id: projectId }),
      TaskModel.exists({ _id: taskId }),
    ]);

    if (!project) {
      return res.status(404).send({
        success: false,
        message: "Cannot create a draft for a project that does not exist",
      });
    }

    if (!task) {
      return res.status(404).send({
        success: false,
        message: "Cannot create a draft for a task that does not exist",
      });
    }

    // Check if the user already has a draft of the same type
    const draft = await DraftModel.findOne({
      authorId: authUser?._id,
      projectId: projectId,
      taskId: taskId,
      type: type,
    });

    if (draft) {
      return res.status(400).send({
        success: false,
        message: "Draft already exists",
        data: draft,
      });
    }

    const newDraft = new DraftModel({
      type: type,
      projectId: projectId,
      taskId: taskId,
      authorId: authUser._id,
      content: content,
    });

    const savedDraft = await newDraft.save();

    return res.status(201).send({
      success: true,
      message: "Draft saved successfully",
      data: savedDraft,
    });
  } catch (err) {
    return res.status(500).send({
      success: false,
      message: err?.message || "Internal server error",
    });
  }
}

export async function getDraft(req, res) {
  try {
    const authUser = res.locals.user;
    const { projectId, taskId, type } = req.query;

    const filters = {};

    filters.authorId = authUser?._id;

    if (!projectId || !taskId || !type) {
      return res.status(400).send({
        success: false,
        message: "Missing required parameters",
      });
    }

    if (type !== "message" && type !== "description") {
      return res.status(400).send({
        success: false,
        message: "Invalid parameter. Must be 'message' or 'description'",
      });
    }

    if (projectId) {
      filters.projectId = projectId;
    }

    if (taskId) {
      filters.taskId = taskId;
    }

    if (type) {
      filters.type = type;
    }

    const draft = await DraftModel.findOne(filters);

    if (!draft) {
      return res.status(404).send({
        success: false,
        message: "No drafts found",
        data: draft,
      });
    }

    return res.status(200).send({
      success: true,
      message: "Drafts retrieved successfully",
      data: draft,
    });
  } catch (err) {
    return res.status(500).send({
      success: false,
      message: err?.message || "Internal server error",
    });
  }
}

export async function updateDraft(req, res) {
  try {
    if (!req.params.id && !req.body.content) {
      return res.status(400).send({
        success: false,
        message: "Missing required parameters",
      });
    }

    const updatedDraft = await DraftModel.findByIdAndUpdate(
      { _id: req.params.id },
      {
        $set: {
          content: req.body.content,
        },
      },
      { new: true, setDefaultsOnInsert: true }
    );

    if (!updatedDraft) {
      return res.status(404).send({
        success: false,
        message: "Draft not found",
        data: updatedDraft,
      });
    }

    return res.status(200).send({
      success: true,
      message: "Draft updated successfully",
      data: updatedDraft,
    });
  } catch (err) {
    return res.status(500).send({
      success: false,
      message: err?.message || "Internal server error",
    });
  }
}

export async function deleteDraft(req, res) {
  try {
    if (!req.params.id) {
      return res.status(400).send({
        success: false,
        message: "Missing required parameters",
      });
    }

    const deletedDraft = await DraftModel.findByIdAndDelete({
      _id: req.params.id,
    });

    if (!deletedDraft) {
      return res.status(404).send({
        success: false,
        message: "Draft not found",
      });
    }

    return res.status(200).send({
      success: true,
      message: "Draft deleted successfully",
      data: deletedDraft,
    });
  } catch (err) {
    return res.status(500).send({
      success: false,
      message: err?.message || "Internal server error",
    });
  }
}
