import mongoose from "mongoose";
import ProjectModel from "../models/Project.model.js";
import { sendEmail } from "../helpers/nodemailer.js";
import ProjectInvitationModel from "../models/ProjectInvitation.model.js";
import UserModel from "../models/User.model.js";
import BoardModel from "../models/Board.model.js";
import TaskModel from "../models/Task.model.js";
import { emailProjectInvitation } from "../templates/emails.js";
import { destroyFile, uploadFileBuffer } from "../helpers/cloudinary.js";

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

    // Trouver l'ordre maximum actuel
    const maxOrder = await ProjectModel.findOne({
      $or: [{ author: authUser._id }, { guests: authUser?._id }],
    })
      .sort({ order: -1 })
      .select("order");

    const newProject = new ProjectModel({
      author: authUser?._id,
      name: name,
      order: maxOrder ? maxOrder.order + 1 : 0, // Définir le nouvel ordre
    });

    const savedProject = await newProject.save();

    // Créer un tableau par défaut
    const newBoard = new BoardModel({
      projectId: savedProject._id,
      title: "Votre premier tableau",
    });

    const savedBoard = await newBoard.save();

    // Utiliser la même logique que dans board.controllers.js
    const randomIndex = Math.floor(Math.random() * savedBoard?.colors.length);
    const randomColor = savedBoard?.colors[randomIndex];

    await BoardModel.findByIdAndUpdate(
      { _id: savedBoard._id },
      {
        $set: {
          color: randomColor,
        },
      },
      {
        new: true,
        setDefaultsOnInsert: true,
      }
    );

    return res.status(201).send({
      success: true,
      message: "Projet créé avec succès",
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
    const authUser = res.locals.user;

    const projects = await ProjectModel.aggregate([
      {
        // Filtrer les projets où l'auteur ou un invité est l'utilisateur connecté
        $match: {
          $or: [{ author: authUser?._id }, { guests: authUser?._id }],
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "author",
          foreignField: "_id",
          as: "author",
        },
      },
      { $unwind: "$author" }, // Transforme author en objet unique
      {
        $lookup: {
          from: "users",
          localField: "guests",
          foreignField: "_id",
          as: "guests",
        },
      },
      {
        $lookup: {
          from: "tasks",
          localField: "_id",
          foreignField: "projectId",
          as: "tasks",
        },
      },
      {
        $addFields: {
          tasksCount: { $size: "$tasks" },
        },
      },
      {
        $project: {
          tasks: 0,
        },
      },
      {
        $sort: {
          order: 1,
        },
      },
    ]);

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

export async function getProject(req, res, next) {
  try {
    const project = await ProjectModel.aggregate([
      {
        $match: { _id: new mongoose.Types.ObjectId(req.params.id) },
      },
      {
        $lookup: {
          from: "users",
          localField: "author",
          foreignField: "_id",
          as: "author",
        },
      },
      { $unwind: "$author" }, // Transforme author en objet unique
      {
        $lookup: {
          from: "users",
          localField: "guests",
          foreignField: "_id",
          as: "guests",
        },
      },
      {
        $lookup: {
          from: "boards",
          localField: "_id",
          foreignField: "projectId",
          as: "boards",
        },
      },
      {
        $lookup: {
          from: "tasks",
          localField: "boards._id",
          foreignField: "boardId",
          as: "tasks",
        },
      },
      {
        $addFields: {
          boardsCount: { $size: "$boards" },
          tasksCount: { $size: "$tasks" },
        },
      },
      {
        $project: {
          "author.password": 0, // Suppression des infos sensibles
          "guests.password": 0,
          boards: 0,
          tasks: 0,
        },
      },
    ]);

    if (!project.length) {
      return res.status(404).send({
        success: false,
        message: "Aucun projet n'a été trouvé dans la base de données",
      });
    }

    return res.status(200).send({
      success: true,
      message: "Projet trouvé",
      data: project[0], // On renvoie le premier (et unique) élément du tableau
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
    const { name, note, urls } = req.body;

    if (!name) {
      return res.status(400).send({
        success: false,
        message: "Paramètres manquants",
      });
    }

    const updatedProject = await ProjectModel.findOneAndUpdate(
      {
        _id: req.params.id,
      },
      {
        $set: {
          name: name,
          note: note,
          urls: urls,
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

export async function updateProjectLogo(req, res) {
  try {
    const logo = req.file;

    if (!logo) {
      return res.status(400).json({
        success: false,
        message: "Aucun fichier n'a été uploadé",
      });
    }

    const project = await ProjectModel.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Impossible de mettre à jour le logo d'un projet inexistant",
      });
    }

    // Si un logo existe déjà, on le supprime d'abord
    if (project.logo) {
      await destroyFile("task/project", project.logo);
    }

    // Upload du nouveau fichier
    const uploadedFile = await uploadFileBuffer(
      "task/project",
      logo.buffer,
      `project_${project._id}_${Date.now()}` // Nom de fichier unique
    );

    if (!uploadedFile || !uploadedFile.secure_url) {
      throw new Error("Échec de l'upload du fichier");
    }

    const updatedProject = await ProjectModel.findByIdAndUpdate(
      { _id: req.params.id },
      { logo: uploadedFile.secure_url },
      { new: true, setDefaultsOnInsert: true }
    );

    return res.status(200).json({
      success: true,
      message: "Logo mis à jour avec succès",
      data: updatedProject,
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour du logo:", error);
    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Une erreur est survenue lors de la mise à jour du logo",
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
    })
      .populate("author", "-password")
      .populate("guests", "-password")
      .exec();

    if (project?.author?.email === email) {
      return res.status(400).send({
        success: false,
        message: "Vous ne pouvez pas vous inviter vous-même",
      });
    }

    if (project?.guests?.some((guest) => guest.email === email)) {
      return res.status(400).send({
        success: false,
        message: "Cet utilisateur a déjà été invité",
      });
    }

    if (!project) {
      return res.status(404).send({
        success: false,
        message: "Impossible d'inviter un utilisateur à un projet inexistant",
      });
    }

    await ProjectInvitationModel.findOneAndDelete({
      guestEmail: email,
      projectId: project._id,
    });

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
    const { invitationId } = req.body;

    const projectInvitation = await ProjectInvitationModel.findById({
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

    await ProjectInvitationModel.findByIdAndDelete({
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

export const updateProjectsOrder = async (req, res) => {
  try {
    const { projects } = req.body;

    // Mise à jour en masse des ordres
    const bulkOps = projects.map((project, index) => ({
      updateOne: {
        filter: { _id: project._id },
        update: { $set: { order: index } },
      },
    }));

    await ProjectModel.bulkWrite(bulkOps);

    return res.status(200).json({
      success: true,
      message: "Ordre des projets mis à jour",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
