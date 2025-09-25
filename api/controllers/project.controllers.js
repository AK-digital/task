import mongoose from "mongoose";
import ProjectModel from "../models/Project.model.js";
import { sendEmail } from "../helpers/nodemailer.js";
import ProjectInvitationModel from "../models/ProjectInvitation.model.js";
import UserModel from "../models/User.model.js";
import BoardModel from "../models/Board.model.js";
import { emailProjectInvitation } from "../templates/emails.js";
import { destroyFile, uploadFileBuffer } from "../helpers/cloudinary.js";
import StatusModel from "../models/Status.model.js";
import {
  getDefaultPriorities,
  getDefaultStatuses,
} from "../helpers/defaultStatuses.js";
import PriorityModel from "../models/Priority.model.js";
import FavoriteModel from "../models/Favorite.model.js";

// When an user creates a new project, his uid will be set in the author field
export async function saveProject(req, res, next) {
  try {
    const authUser = res.locals.user;
    const { name, skipDefaultBoard } = req.body;

    if (!name) {
      return res
        .status(400)
        .send({ success: false, message: "Paramètres manquants" });
    }

    const newProject = new ProjectModel({
      name: name,
      members: [
        {
          user: authUser._id,
          role: "owner",
        },
      ],
    });

    const savedProject = await newProject.save();

    // Créer un tableau par défaut seulement si skipDefaultBoard n'est pas true
    if (!skipDefaultBoard) {
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
    }

    const defaultStatuses = getDefaultStatuses(savedProject?._id);
    const defaultPriorities = getDefaultPriorities(savedProject?._id);

    await StatusModel.insertMany(defaultStatuses);
    await PriorityModel.insertMany(defaultPriorities);

    const newFavorite = new FavoriteModel({
      user: authUser._id,
      project: savedProject._id,
    });

    await newFavorite.save();

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

export async function getUserProjects(req, res, next) {
  try {
    const authUser = res.locals.user;

    // A .pre aggregate is set in ProjectModel to get the membersData, statuses, tasks and boards
    const projects = await ProjectModel.aggregate([
      {
        $match: {
          "members.user": authUser._id,
        },
      },
      {
        $sort: {
          name: 1,
        },
      },
    ]);

    if (projects.length <= 0) {
      return res.status(404).send({
        success: false,
        message: "Aucun projet n'a été trouvé dans la base de données",
      });
    }

    // Sérialiser les projets pour éviter les problèmes avec Next.js
    const serializedProjects = projects.map(project => 
      JSON.parse(JSON.stringify(project))
    );

    return res.status(200).send({
      success: true,
      message: "Projets trouvés",
      data: serializedProjects,
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
    const project = await ProjectModel.findById(req.params.id)
      .populate("members.user", "name email picture")
      .lean(); // Convertit en objet JavaScript plain

    if (!project) {
      return res.status(404).send({
        success: false,
        message: "Aucun projet n'a été trouvé dans la base de données",
      });
    }

    // Créer un objet plain manuellement pour éviter les problèmes de sérialisation
    const plainProject = {
      _id: project._id.toString(),
      name: project.name,
      note: project.note,
      urls: project.urls,
      logo: project.logo,
      archived: project.archived,
      members: project.members?.map(member => ({
        user: {
          _id: member.user._id.toString(),
          name: member.user.name,
          email: member.user.email,
          picture: member.user.picture
        },
        role: member.role,
        _id: member._id.toString()
      })) || [],
      createdAt: project.createdAt ? new Date(project.createdAt).toISOString() : null,
      updatedAt: project.updatedAt ? new Date(project.updatedAt).toISOString() : null,
    };

    return res.status(200).send({
      success: true,
      message: "Projet trouvé",
      data: plainProject,
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
      await destroyFile("clynt/project", project.logo);
    }

    // Upload du nouveau fichier
    const uploadedFile = await uploadFileBuffer("clynt/project", logo.buffer);

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

export async function leaveProject(req, res) {
  try {
    const authUser = res.locals.user;

    const project = await ProjectModel.findById({
      _id: req.params.id,
    });

    if (!project) {
      return res.status(404).send({
        success: false,
        message: "Impossible de quitter le projet existant",
      });
    }

    const isManagerOrTeam = project?.members?.some(
      (member) =>
        member?.user.toString() !== authUser._id.toString() &&
        (member?.role === "manager" || member?.role === "team")
    );

    if (project?.members?.length <= 1 && !isManagerOrTeam) {
      await ProjectModel.findByIdAndDelete({ _id: req.params.id });
    } else {
      const leavingMember = project.members.find(
        (member) => member.user.toString() === authUser._id.toString()
      );

      if (leavingMember && leavingMember.role === "owner" && isManagerOrTeam) {
        const newOwner = project.members.find(
          (member) =>
            member.user.toString() !== authUser._id.toString() &&
            (member.role === "manager" || member.role === "team")
        );
        if (newOwner) {
          newOwner.role = "owner";
        }
      }


      project.members = project?.members?.filter(
        (member) => member?.user?.toString() !== authUser?._id.toString()
      );

      await project.save();

      await FavoriteModel.findOneAndDelete({
        user: authUser._id,
        project: req.params.id,
      });
    }

    return res.status(200).send({
      success: true,
      message: "Vous avez quitté le projet",
      data: project,
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
    const deletedProject = await ProjectModel.findByIdAndDelete({
      _id: req.params.id,
    });

    if (!deletedProject) {
      return res.status(404).send({
        success: false,
        message: "Impossible de supprimer un projet inexistant",
      });
    }

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
      .populate("members.user", "-password")
      .exec();

    const members = project?.members || [];

    const isMember = members?.some((member) => member?.user?.email === email);

    if (isMember) {
      return res.status(400).send({
        success: false,
        message: "Cet utilisateur est déjà membre du projet",
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
          members: {
            user: user?._id,
            role: projectInvitation?.role || "guest",
          },
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

export async function updateProjectRole(req, res, next) {
  try {
    const { memberId, role } = req.body;
    const rolesEnum = ["owner", "manager", "team", "customer", "guest"]; // Enum of roles based on the model

    // Body validation
    if (!memberId || !role) {
      return res.status(400).send({
        success: false,
        message: "Paramètres manquants",
      });
    }

    // Check if the given role is valid
    if (!rolesEnum.includes(role)) {
      return res.status(400).send({
        success: false,
        messsage: "Rôle invalide",
      });
    }

    const project = await ProjectModel.findById({ _id: req.params.id });

    if (!project) {
      return res.status(404).send({
        success: false,
        message: "Impossible de modifier le rôle d'un projet inexistant",
      });
    }

    // Get the member to update based on the memberId
    const member = project?.members?.find(
      (member) => member.user.toString() === memberId.toString()
    );

    if (!member) {
      return res.status(404).send({
        success: false,
        message: "Impossible de modifier le rôle d'un utilisateur inexistant",
      });
    }

    // Update the role of the member
    member.role = role;

    // Save the project with the updated member role
    await project?.save();

    return res.status(200).send({
      success: true,
      message: "Rôle de l'utilisateur mis à jour avec succès",
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
          members: {
            user: guestId,
          },
        },
      },
      {
        new: true,
        setDefaultsOnInsert: true,
      }
    );

    await FavoriteModel.findOneAndDelete({
      user: guestId,
      project: req.params.id,
    });

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
    console.log(err);
    return res.status(500).send({
      success: false,
      message: err.message || "Une erreur inattendue est survenue",
    });
  }
}

export const updateProjectsOrder = async (req, res) => {
  try {
    const authUser = res.locals.user;
    const { projects } = req.body;

    // Mise à jour de l'ordre spécifique à ce user dans chaque projet
    const bulkOps = projects.map((project, index) => ({
      updateOne: {
        filter: {
          _id: project._id,
          "members.user": authUser._id,
        },
        update: {
          $set: {
            "members.$.order": index,
          },
        },
      },
    }));

    await ProjectModel.bulkWrite(bulkOps);

    return res.status(200).json({
      success: true,
      message: "Ordre des projets mis à jour pour l'utilisateur",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const exportProject = async (req, res) => {
  try {
    const projectId = req.params.id;

    // Récupérer le projet avec toutes ses données
    const project = await ProjectModel.findById(projectId);
    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Projet non trouvé",
      });
    }

    // Récupérer tous les tableaux du projet
    const boards = await BoardModel.find({ projectId }).lean();

    // Récupérer toutes les tâches du projet
    const TaskModel = (await import("../models/Task.model.js")).default;
    const tasks = await TaskModel.find({ projectId }).lean();

    // Récupérer les statuts du projet
    const StatusModel = (await import("../models/Status.model.js")).default;
    const statuses = await StatusModel.find({ projectId }).lean();

    // Récupérer les priorités du projet
    const PriorityModel = (await import("../models/Priority.model.js")).default;
    const priorities = await PriorityModel.find({ projectId }).lean();

    // Créer l'objet d'export avec toutes les données
    const exportData = {
      project: {
        name: project.name,
        note: project.note,
        urls: project.urls,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
      },
      boards,
      tasks,
      statuses,
      priorities,
      exportedAt: new Date(),
      exportVersion: "1.0",
    };

    return res.status(200).json({
      success: true,
      message: "Projet exporté avec succès",
      data: exportData,
    });
  } catch (error) {
    console.error("Erreur lors de l'export:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Erreur lors de l'export du projet",
    });
  }
};

export const importProject = async (req, res) => {
  try {
    const authUser = res.locals.user;
    const { projectData } = req.body;

    // Vérifier que les données sont valides
    if (!projectData || !projectData.project || !projectData.exportVersion) {
      return res.status(400).json({
        success: false,
        message: "Données d'import invalides",
      });
    }

    // Créer le nouveau projet
    const newProject = new ProjectModel({
      name: `${projectData.project.name} (Importé)`,
      note: projectData.project.note,
      urls: projectData.project.urls || [],
      members: [
        {
          user: authUser._id,
          role: "owner",
        },
      ],
    });

    const savedProject = await newProject.save();

    // Importer les statuts
    const StatusModel = (await import("../models/Status.model.js")).default;
    const statusMapping = {};
    
    if (projectData.statuses && projectData.statuses.length > 0) {
      for (const status of projectData.statuses) {
        const newStatus = new StatusModel({
          name: status.name,
          color: status.color,
          projectId: savedProject._id,
        });
        const savedStatus = await newStatus.save();
        statusMapping[status._id] = savedStatus._id;
      }
    } else {
      // Créer les statuts par défaut
      const defaultStatuses = getDefaultStatuses(savedProject._id);
      await StatusModel.insertMany(defaultStatuses);
    }

    // Importer les priorités
    const PriorityModel = (await import("../models/Priority.model.js")).default;
    const priorityMapping = {};
    
    if (projectData.priorities && projectData.priorities.length > 0) {
      for (const priority of projectData.priorities) {
        const newPriority = new PriorityModel({
          name: priority.name,
          color: priority.color,
          projectId: savedProject._id,
        });
        const savedPriority = await newPriority.save();
        priorityMapping[priority._id] = savedPriority._id;
      }
    } else {
      // Créer les priorités par défaut
      const defaultPriorities = getDefaultPriorities(savedProject._id);
      await PriorityModel.insertMany(defaultPriorities);
    }

    // Importer les tableaux
    const boardMapping = {};
    
    if (projectData.boards && projectData.boards.length > 0) {
      for (const board of projectData.boards) {
        const newBoard = new BoardModel({
          title: board.title,
          color: board.color,
          projectId: savedProject._id,
        });
        const savedBoard = await newBoard.save();
        boardMapping[board._id] = savedBoard._id;
      }
    } else {
      // Créer un tableau par défaut
      const newBoard = new BoardModel({
        projectId: savedProject._id,
        title: "Tableau principal",
      });
      const savedBoard = await newBoard.save();
      
      // Assigner une couleur aléatoire
      const randomIndex = Math.floor(Math.random() * savedBoard.colors.length);
      const randomColor = savedBoard.colors[randomIndex];
      
      await BoardModel.findByIdAndUpdate(
        savedBoard._id,
        { $set: { color: randomColor } },
        { new: true }
      );
    }

    // Importer les tâches
    if (projectData.tasks && projectData.tasks.length > 0) {
      const TaskModel = (await import("../models/Task.model.js")).default;
      
      for (const task of projectData.tasks) {
        // Préparer la description en respectant les limites
        let taskDescription = null;
        if (task.description) {
          if (typeof task.description === 'string') {
            // Si c'est une chaîne, la tronquer si nécessaire
            taskDescription = {
              text: task.description.length > 1250 ? task.description.substring(0, 1247) + '...' : task.description,
              author: authUser._id,
              createdAt: new Date(),
              updatedAt: new Date(),
            };
          } else if (task.description.text) {
            // Si c'est un objet avec text, tronquer le text si nécessaire
            taskDescription = {
              ...task.description,
              text: task.description.text.length > 1250 ? task.description.text.substring(0, 1247) + '...' : task.description.text,
              author: authUser._id,
              createdAt: task.description.createdAt || new Date(),
              updatedAt: new Date(),
            };
          }
        }

        const newTask = new TaskModel({
          text: task.text || task.title || 'Tâche importée',
          description: taskDescription,
          projectId: savedProject._id,
          boardId: boardMapping[task.boardId] || Object.values(boardMapping)[0],
          status: statusMapping[task.status] || Object.values(statusMapping)[0],
          priority: priorityMapping[task.priority] || Object.values(priorityMapping)[0],
          archived: task.archived || false,
          author: authUser._id,
        });
        
        await newTask.save();
      }
    }

    // Créer un favori pour l'utilisateur
    const newFavorite = new FavoriteModel({
      user: authUser._id,
      project: savedProject._id,
    });
    await newFavorite.save();

    return res.status(201).json({
      success: true,
      message: "Projet importé avec succès",
      data: savedProject,
    });
  } catch (error) {
    console.error("Erreur lors de l'import:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Erreur lors de l'import du projet",
    });
  }
};
