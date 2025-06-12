import PriorityModel from "../models/Priority.model.js";
import TaskModel from "../models/Task.model.js";

export async function savePriority(req, res) {
  try {
    const { projectId } = req.query;
    const { name, color } = req.body;

    if (!color) {
      return res.status(400).send({
        success: false,
        message: "Missings parameters",
      });
    }

    const newPriority = new PriorityModel({
      projectId: projectId,
      name: name,
      color: color,
      default: false,
    });

    const savedPriority = await newPriority.save();

    if (!savedPriority) {
      return res.status(500).send({
        success: false,
        message: "Failed to save custom priority",
      });
    }

    return res.status(201).send({
      success: true,
      message: "Priority saved successfully",
      data: savedPriority,
    });
  } catch (err) {
    console.error(err);

    if (err.code === 11000) {
      return res.status(409).send({
        success: false,
        message: "This priority already exists",
      });
    }

    return res.status(500).send({
      success: false,
      message: err.message || "Internal server error",
    });
  }
}

export async function getPriorityByProject(req, res) {
  try {
    const priority = await PriorityModel.find({
      projectId: req.params.id,
    }).sort({
      createdAt: 1,
    });

    if (!priority.length === 0) {
      return res.status(404).send({
        success: false,
        message: "Priority not found",
      });
    }

    return res.status(200).send({
      success: true,
      message: "Priority retrieved successfully",
      data: priority,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send({
      success: false,
      message: err.message || "Internal server error",
    });
  }
}

export async function getPrioritiesByProjects(req, res) {
  try {
    const authUser = res.locals.user;

    const tasks = await TaskModel.find({
      responsibles: authUser?._id,
    });

    if (!tasks) {
      return res.status(404).send({
        success: false,
        message: "Tasks not found",
        data: [],
      });
    }

    const projectsIds = [
      ...new Set(tasks?.map((task) => task?.projectId?._id)),
    ];

    const priorities = await PriorityModel.find({
      projectId: { $in: projectsIds },
    });

    if (!priorities.length === 0) {
      return res.status(404).send({
        success: false,
        message: "Priorities not found",
        data: [],
      });
    }

    return res.status(200).send({
      success: true,
      message: "Priorities retrieved successfully",
      data: priorities,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send({
      success: false,
      message: err.message || "Internal server error",
    });
  }
}

export async function updatePriority(req, res) {
  try {
    const { name, color } = req.body;

    if (!name || !color) {
      return res.status(400).send({
        success: false,
        message: "Missing parameters",
      });
    }

    const updatedPriority = await PriorityModel.findByIdAndUpdate(
      { _id: req.params.id },
      {
        $set: { name: name, color: color },
      },
      { new: true }
    );

    if (!updatedPriority) {
      return res.status(404).send({
        success: false,
        message: "Impossible to update a priority that does not exist",
      });
    }

    return res.status(200).send({
      success: true,
      message: "Priority updated successfully",
      data: updatedPriority,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send({
      success: false,
      message: err.message || "Internal server error",
    });
  }
}

export async function deletePriority(req, res) {
  try {
    const { projectId } = req.query;

    const priority = await PriorityModel.findById({ _id: req.params.id });

    if (!priority) {
      return res.status(400).send({
        success: false,
        message: "Impossible to delete a priority that does not exist",
      });
    }

    if (priority.default) {
      return res.status(400).send({
        success: false,
        message: "Impossible to delete a default priority",
      });
    }

    const defaultPriority = await PriorityModel.findOne({
      projectId: projectId,
      default: true,
      priority: "medium",
    });

    await TaskModel.updateMany(
      { priority: priority?._id },
      { $set: { priority: defaultPriority?._id } }
    );

    const deletedPriority = await PriorityModel.findByIdAndDelete({
      _id: req.params.id,
    });

    if (!deletedPriority) {
      return res.status(404).send({
        success: false,
        message: "Impossible to delete a priority that does not exist",
      });
    }

    return res.status(200).send({
      success: true,
      message: "Priority deleted successfully",
      data: deletedPriority,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send({
      success: false,
      message: err.message || "Internal server error",
    });
  }
}
