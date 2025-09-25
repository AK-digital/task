import StatusModel from "../models/Status.model.js";
import TaskModel from "../models/Task.model.js";

export async function saveStatus(req, res) {
  try {
    const { projectId } = req.query;
    const { name, color, todo } = req.body;

    if (!color) {
      return res.status(400).send({
        success: false,
        message: "Missing parameters",
      });
    }

    const newStatus = new StatusModel({
      projectId: projectId,
      name: name,
      color: color,
      default: false,
      todo: todo || false, // Accepter la valeur fournie ou false par défaut
    });

    const savedStatus = await newStatus.save();

    if (!savedStatus) {
      return res.status(500).send({
        success: false,
        message: "Failed to save custom status",
      });
    }

    return res.status(201).send({
      success: true,
      message: "Status saved successfully",
      data: savedStatus,
    });
  } catch (err) {
    console.error(err);

    if (err.code === 11000) {
      return res.status(409).send({
        success: false,
        message: "This status already exists",
      });
    }

    return res.status(500).send({
      success: false,
      message: err.message || "Internal server error",
    });
  }
}

export async function getStatusByProject(req, res) {
  try {
    const status = await StatusModel.find({ projectId: req.params.id }).sort({
      createdAt: 1,
    }).lean();

    if (!status.length === 0) {
      return res.status(404).send({
        success: false,
        message: "Status not found",
      });
    }

    return res.status(200).send({
      success: true,
      message: "Status retrieved successfully",
      data: status,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send({
      success: false,
      message: err.message || "Internal server error",
    });
  }
}

export async function getStatusesByProjects(req, res) {
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

    const statuses = await StatusModel.find({
      projectId: { $in: projectsIds },
    });

    if (!statuses.length === 0) {
      return res.status(404).send({
        success: false,
        message: "Statuses not found",
        data: [],
      });
    }

    return res.status(200).send({
      success: true,
      message: "Statuses retrieved successfully",
      data: statuses,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send({
      success: false,
      message: err.message || "Internal server error",
    });
  }
}

export async function updateStatus(req, res) {
  try {
    const { name, color, todo } = req.body;

    if (!name || !color) {
      return res.status(400).send({
        success: false,
        message: "Missing parameters",
      });
    }

    // Récupérer le statut existant pour connaître son type
    const existingStatus = await StatusModel.findById(req.params.id);
    if (!existingStatus) {
      return res.status(404).send({
        success: false,
        message: "Status not found",
      });
    }

    const updateData = { name: name, color: color };
    
    // Si c'est un statut de type "todo", la propriété todo est toujours true (immuable)
    // Sinon, accepter la valeur fournie dans la requête
    if (existingStatus.status === "todo") {
      updateData.todo = true; // Immuable pour les statuts de type "todo"
    } else {
      updateData.todo = todo !== undefined ? todo : existingStatus.todo; // Garder la valeur existante si non fournie
    }

    const updatedStatus = await StatusModel.findByIdAndUpdate(
      { _id: req.params.id },
      { $set: updateData },
      { new: true }
    );

    if (!updatedStatus) {
      return res.status(404).send({
        success: false,
        message: "Impossible to update a status that does not exist",
      });
    }

    return res.status(200).send({
      success: true,
      message: "Status updated successfully",
      data: updatedStatus,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send({
      success: false,
      message: err.message || "Internal server error",
    });
  }
}

export async function deleteStatus(req, res) {
  try {
    const { projectId } = req.query;

    const status = await StatusModel.findById({ _id: req.params.id });

    if (!status) {
      return res.status(400).send({
        success: false,
        message: "Impossible to delete a status that does not exist",
      });
    }

    if (status.default) {
      return res.status(400).send({
        success: false,
        message: "Impossible to delete a default status",
      });
    }

    const defaultStatus = await StatusModel.findOne({
      projectId: projectId,
      default: true,
      status: "waiting",
    });

    await TaskModel.updateMany(
      { status: status?._id },
      { $set: { status: defaultStatus?._id } }
    );

    const deletedStatus = await StatusModel.findByIdAndDelete({
      _id: req.params.id,
    });

    if (!deletedStatus) {
      return res.status(404).send({
        success: false,
        message: "Impossible to delete a status that does not exist",
      });
    }

    return res.status(200).send({
      success: true,
      message: "Status deleted successfully",
      data: deletedStatus,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send({
      success: false,
      message: err.message || "Internal server error",
    });
  }
}
