import mongoose from "mongoose";
import ProjectModel from "../models/Project.model.js";
import { sendEmail } from "../helpers/nodemailer.js";
import ProjectInvitationModel from "../models/ProjectInvitation.model.js";
import UserModel from "../models/User.model.js";
import BoardModel from "../models/Board.model.js";
import TaskModel from "../models/Task.model.js";
import { emailProjectInvitation } from "../templates/emails.js";

// When an user creates a new project, his uid will be set in the author field
export async function saveProject(req, res, next) {
  try {
    const authUser = res.locals.user;
    const { name } = req.body;

    if (!name) {
      return res
        .status(400)
        .send({ success: false, message: "Paramètres manquants" });
    }

    const newProject = new ProjectModel({
      author: authUser?._id,
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
        message: "Aucun projet n'a été trouvé dans la base de données",
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

    const project = await ProjectModel.findOne(query)
      .populate({
        path: "guests author",
        select: "lastName firstName email picture _id",
      })
      .exec();

    if (!project) {
      return res.status(404).send({
        success: false,
        message: "Aucun projet n'a été trouvé dans la base de données",
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
    const { name } = req.body;

    const updatedProject = await ProjectModel.findOneAndUpdate(
      {
        _id: req.params.id,
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
    const deletedProject = await ProjectModel.findById({
      _id: req.params.id,
    });

    if (!deletedProject) {
      return res.status(404).send({
        success: false,
        message: "Impossible de supprimer un projet inexistant",
      });
    }

    // Cascade delete related boards and tasks
    await BoardModel.deleteMany({ projectId: deletedProject?._id });
    await TaskModel.deleteMany({ projectId: deletedProject?._id });
    await ProjectModel.findByIdAndDelete({ _id: req.params.id });

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
export async function sendProjectInvitationToGuest(req, res, next) {
  try {
    const authUser = res.locals.user;
    const authEmail = authUser?.email;
    const { email } = req.body;

    if (!email) {
      return res
        .status(400)
        .send({ success: false, message: "Paramètres manquants" });
    }

    const project = await ProjectModel.findById({
      _id: req.params.id,
    });

    if (!project) {
      return res.status(404).send({
        success: false,
        message: "Impossible d'inviter un utilisateur à un projet inexistant",
      });
    }

    const newProjectInvitation = new ProjectInvitationModel({
      projectId: project?._id,
      guestEmail: email,
    });

    await newProjectInvitation.save();

    const link = `${process.env.CLIENT_URL}/invitation/${newProjectInvitation?._id}`;
    const template = emailProjectInvitation(project, authUser, link);

    await sendEmail(authEmail, email, template.subjet, template.text);

    return res.status(200).send({
      success: true,
      message: "Invitation par e-mail envoyé avec succès",
      data: newProjectInvitation,
    });
  } catch (err) {
    return res.status(500).send({
      success: false,
      message: err.message || "Une erreur inattendue est survenue",
    });
  }
}

// Accept project invitation
export async function acceptProjectInvitation(req, res, next) {
  try {
    const authUser = res.locals.user;
    const { invitationId } = req.body;

    console.log(authUser?.email);
    console.log(invitationId);

    const projectInvitation = await ProjectInvitationModel.findOne({
      guestEmail: authUser?.email,
      status: "pending",
      _id: invitationId,
    });

    if (!projectInvitation) {
      return res.status(404).send({
        success: false,
        message: "Impossible d'accepter une invitation qui n'existe pas",
      });
    }

    const user = await UserModel.findOne({
      email: projectInvitation.guestEmail,
    });

    if (!user) {
      return res.status(404).send({
        success: false,
        message:
          "Impossible d'accepter l'invitation d'un utilisateur qui n'existe pas",
      });
    }

    const project = await ProjectModel.findByIdAndUpdate(
      {
        _id: projectInvitation?.projectId,
      },
      {
        $addToSet: {
          guests: user?._id,
        },
      },
      {
        new: true,
        setDefaultsOnInsert: true,
      }
    );

    if (!project) {
      return res.status(404).send({
        success: false,
        message:
          "Impossible d'accepter l'invitation d'un projet qui n'existe pas",
      });
    }

    await ProjectInvitationModel.findOneAndDelete({
      _id: projectInvitation?._id,
    });

    return res.status(200).send({
      success: true,
      message: "Un nouvel utilisateur a rejoint le projet avec succès",
      data: project,
    });
  } catch (err) {
    return res.status(500).send({
      success: false,
      message: err.message || "Une erreur inattendue est survenue",
    });
  }
}

// Only the author can remove a guest
export async function removeGuest(req, res, next) {
  try {
    const { guestId } = req.body;

    const updatedProject = await ProjectModel.findOneAndUpdate(
      {
        _id: req.params.id,
      },
      {
        $pull: {
          guests: guestId,
        },
      },
      {
        new: true,
        setDefaultsOnInsert: true,
      }
    );

    if (!updatedProject) {
      return res.status(404).send({
        success: false,
        message:
          "Impossible de supprimer un inviter d'un projet qui n'existe pas",
      });
    }

    return res.status(200).send({
      success: true,
      message: "Invité supprimer du projet avec succès",
      data: updatedProject,
    });
  } catch (err) {
    return res.status(500).send({
      success: false,
      message: err.message || "Une erreur inattendue est survenue",
    });
  }
}
