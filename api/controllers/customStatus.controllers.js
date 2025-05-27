import CustomStatusModel from "../models/CustomStatus.model.js";

export async function saveCustomStatus(req, res) {
  try {
    const { projectId } = req.query;
    const { status, color } = req.body;

    if (!status || !color) {
      return res.status(400).send({
        success: false,
        message: "Missing parameters",
      });
    }

    const newCustomStatus = new CustomStatusModel({
      projectId: projectId,
      status: status,
      color: color,
    });

    const savedCustomStatus = await newCustomStatus.save();

    if (!savedCustomStatus) {
      return res.status(500).send({
        success: false,
        message: "Failed to save custom status",
      });
    }

    return res.status(201).send({
      success: true,
      message: "Custom status saved successfully",
      data: savedCustomStatus,
    });
  } catch (err) {
    console.error(err);

    if (err.code === 11000) {
      return res.status(409).send({
        success: false,
        message: "Custom status already exists",
      });
    }

    return res.status(500).send({
      success: false,
      message: err.message || "Internal server error",
    });
  }
}

export async function getCustomStatus(req, res) {
  try {
    const { projectId } = req.query;

    const customStatus = await CustomStatusModel.find({ projectId: projectId });

    if (!customStatus.length <= 0) {
      return res.status(404).send({
        success: false,
        message: "Custom status not found",
      });
    }

    return res.status(200).send({
      success: true,
      message: "Custom status retrieved successfully",
      data: customStatus,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send({
      success: false,
      message: err.message || "Internal server error",
    });
  }
}

export async function updateCustomStatus(req, res) {
  try {
    const { status, color } = req.body;

    if (!status || !color) {
      return res.status(400).send({
        success: false,
        message: "Missing parameters",
      });
    }

    const updatedCustomStatus = await CustomStatusModel.findByIdAndUpdate(
      { _id: req.params.id },
      {
        $set: { status: status, color: color },
      },
      { new: true }
    );

    if (!updatedCustomStatus) {
      return res.status(404).send({
        success: false,
        message: "Impossible to update a custom status that does not exist",
      });
    }

    return res.status(200).send({
      success: true,
      message: "Custom status updated successfully",
      data: updatedCustomStatus,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send({
      success: false,
      message: err.message || "Internal server error",
    });
  }
}

export async function deleteCustomStatus(req, res) {
  try {
    const deletedCustomStatus = await CustomStatusModel.findByIdAndDelete({
      _id: req.params.id,
    });

    if (!deletedCustomStatus) {
      return res.status(404).send({
        success: false,
        message: "Impossible to delete a custom status that does not exist",
      });
    }

    return res.status(200).send({
      success: true,
      message: "Custom status deleted successfully",
      data: deletedCustomStatus,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send({
      success: false,
      message: err.message || "Internal server error",
    });
  }
}
