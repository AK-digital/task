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
      statuses: [
        {
          status: status,
          color: color,
        },
      ],
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
    return res.status(500).send({
      success: false,
      message: err.message || "Internal server error",
    });
  }
}

export async function getCustomStatus(req, res) {
  try {
    const { projectId } = req.query;

    if (!projectId) {
      return res.status(400).send({
        success: false,
        message: "Missing parameters",
      });
    }

    const customStatus = await CustomStatusModel.findOne({ projectId });

    if (!customStatus) {
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
    console.log("played");
    const { status, color } = req.body;

    if (!status || !color) {
      return res.status(400).send({
        success: false,
        message: "Missing parameters",
      });
    }

    const updatedCustomStatus = await CustomStatusModel.findOneAndUpdate(
      { "statuses._id": req.params.id },
      {
        $set: {
          "statuses.status": status,
          "statuses.color": color,
        },
      },
      {
        new: true,
        setDefaultsOnInsert: true,
      }
    );

    if (!updatedCustomStatus) {
      return res.status(404).send({
        success: false,
        message: "Custom status not found",
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
    const deletedCustomStatus = await CustomStatusModel.findOneAndDelete({
      "statuses._id": req.params.id,
    });

    if (!deletedCustomStatus) {
      return res.status(404).send({
        success: false,
        message: "Custom status not found",
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
