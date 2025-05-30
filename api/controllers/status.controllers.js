import StatusModel from "../models/Status.model.js";
import TaskModel from "../models/Task.model.js";

export async function saveStatus(req, res) {
  try {
    const { projectId } = req.query;
    const { name, color } = req.body;

    if (!color) {
      return res.status(400).send({
        success: false,
        message: "Missings parameters",
      });
    }

    const newStatus = new StatusModel({
      projectId: projectId,
      name: name,
      color: color,
      default: false,
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
    });

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

export async function getUserProjectsStatuses(req, res) {
  try {
    const authUser = res.locals.user;

    const projects = await ProjectModel.find({
      members: { $in: [authUser._id] },
    });

    if (!projects.length === 0) {
      return res.status(404).send({
        success: false,
        message: "Projects not found",
        data: [],
      });
    }

    const statuses = await StatusModel.find({
      projectId: { $in: projects.map((project) => project._id) },
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
    const { name, color } = req.body;

    if (!name || !color) {
      return res.status(400).send({
        success: false,
        message: "Missing parameters",
      });
    }

    const updatedStatus = await StatusModel.findByIdAndUpdate(
      { _id: req.params.id },
      {
        $set: { name: name, color: color },
      },
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
