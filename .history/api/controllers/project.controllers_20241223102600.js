import mongoose from "mongoose";
import ProjectModel from "../models/Project.model.js";
import { sendEmail } from "../helpers/nodemailer.js";

// When an user creates a new project, his uid will be set in the author field
export async function saveProject(req, res, next) {
  try {
    const { userId } = req.query; // Important to check if an user is trying to post on the behalf of the user
    const { name } = req.body;

    if (!userId || !name) {
      return res
        .status(400)
        .send({ success: false, message: "Paramètres manquants" });
    }

    const newProject = new ProjectModel({
      author: userId,
      name: name,
    });

    const savedProject = await newProject.save();

    return res.status(201).send({
      success: true,
      message: "Projet créée avec succès",
      data: savedProject,
    });
  } catch (err) {
    return res.status(500).send({
      success: false,
      message: err.message || "Une erreur inattendue est survenue",
    });
  }
}

// Only authors and guests will be able to see the projects
export async function getProjects(req, res, next) {
  try {
    const authUser = res.locals.user; // Getting the informations of the logged user

    // Only if auth user is the author or if the auth user is in guests array the projects will be returned
    const projects = await ProjectModel.find({
      $or: [{ author: authUser._id }, { guests: authUser?._id }],
    });

    if (projects.length <= 0) {
      return res.status(404).send({
        success: false,
        message: "L'utilisateur ne fait partie d'aucun projet",
      });
    }

    return res.status(200).send({
      success: true,
      message: "Projets trouvés",
      data: projects,
    });
  } catch (err) {
    return res.status(500).send({
      success: false,
      message: err.message || "Une erreur inattendue est survenue",
    });
  }
}

// Only authors and guests will be able to see the project
export async function getProject(req, res, next) {
  try {
    const authUser = res.locals.user; // Getting the informations of the logged user
    let query = {};

    // Checking if the params is a valid object ID
    if (mongoose.Types.ObjectId.isValid(req.params.id)) {
      // Then try to get the project by his ID
      query._id = req.params.id;
    } else {
      // If not then try to get the project by his name
      query.name = {
        $regex: req.params.id.replaceAll("-", " "),
        $options: "i",
      };
    }

    // Only if auth user is the author or if the auth user is in guests array the projects will be returned
    query.$or = [{ author: authUser._id }, { guests: authUser._id }];

    const project = await ProjectModel.findOne(query);

    if (!project) {
      return res.status(404).send({
        success: false,
        message: "L'utilisateur ne fait partie d'aucun projet",
      });
    }

    return res.status(200).send({
      success: true,
      message: "Projet trouvé",
      data: project,
    });
  } catch (err) {
    return res.status(500).send({
      success: false,
      message: err.message || "Une erreur inattendue est survenue",
    });
  }
}

// Authors and guests will be able to update the project
export async function updateProject(req, res, next) {
  try {
    const authUser = res.locals.user;
    const { name } = req.body;

    const updatedProject = await ProjectModel.findOneAndUpdate(
      {
        _id: req.params.id,
        // Only if auth user is the author or if the auth user is in guests array the projects will be find and updated
        $or: [{ author: authUser?._id }, { guests: authUser?._id }],
      },
      {
        $set: {
          name: name,
        },
      },
      { new: true, setDefaultsOnInsert: true }
    );

    if (!updatedProject) {
      return res.status(404).send({
        success: false,
        message: "Impossible de modifier un projet inexistant",
      });
    }

    return res.status(200).send({
      success: true,
      message: "Projet modifié avec succès",
      data: updatedProject,
    });
  } catch (err) {
    return res.status(500).send({
      success: false,
      message: err.message || "Une erreur inattendue est survenue",
    });
  }
}
// Only the author will be able to delete the project
export async function deleteProject(req, res, next) {
  try {
    const authUser = res.locals.user;

    const deletedProject = await ProjectModel.findOneAndDelete({
      _id: req.params.id,
      // Only if auth user is the author or if the auth user is in guests array the projects will be find and updated
      author: authUser?._id,
    });

    if (!deletedProject) {
      return res.status(404).send({
        success: false,
        message: "Impossible de supprimer un projet inexistant",
      });
    }

    // CASCADE DELETE BOARDS AND TASK NEED TO BE ADDED

    return res.status(200).send({
      success: true,
      message: "Projet supprimé avec succès",
      data: deletedProject,
    });
  } catch (err) {
    return res.status(500).send({
      success: false,
      message: err.message || "Une erreur inattendue est survenue",
    });
  }
}

// send guest invitation logic
export async function sendGuestInvit(req, res, next) {
  try {
    const { email } = req.body;

    await sendEmail();
  } catch (err) {
    return res.status(500).send({
      success: false,
      message: err.message || "Une erreur inattendue est survenue",
    });
  }
}

export async function removeGuest(req, res, next) {}
