import FavoriteModel from "../models/Favorite.model.js";

export async function saveFavorite(req, res) {
  try {
    const authUser = res.locals.user;
    const { projectId } = req.body;

    if (!projectId) {
      return res.status(400).send({
        success: false,
        message: "Missing parameters",
      });
    }

    const newFavorite = new FavoriteModel({
      user: authUser._id,
      project: projectId,
    });

    const savedFavorite = await newFavorite.save();

    if (!savedFavorite) {
      return res.status(400).send({
        success: false,
        message: "Failed to save favorite",
      });
    }

    return res.status(200).send({
      success: true,
      message: "Favorite saved successfully",
      data: savedFavorite,
    });
  } catch (err) {
    return res.status(500).send({
      success: false,
      message: err.message || "Internal server error",
    });
  }
}

// Récupère les favoris de l'utilisateur avec les détails des projets
export async function getFavorites(req, res) {
  try {
    const authUser = res.locals.user;

    const favorites = await FavoriteModel.aggregate([
      { $match: { user: authUser._id } },
      {
        $lookup: {
          from: "projects",
          localField: "project",
          foreignField: "_id",
          as: "project",
        },
      },
      { $unwind: "$project" },
      { $sort: { "project.name": 1 } },
    ]);

    if (!favorites || favorites.length === 0) {
      return res.status(404).send({
        success: false,
        message: "No favorites found",
      });
    }

    return res.status(200).send({
      success: true,
      message: "Favorites fetched successfully",
      data: favorites,
    });
  } catch (err) {
    return res.status(500).send({
      success: false,
      message: err.message || "Internal server error",
    });
  }
}

export async function deleteFavorite(req, res) {
  try {
    if (!req.params.id) {
      return res.status(400).send({
        success: false,
        message: "Missing parameters",
      });
    }

    const deletedFavorite = await FavoriteModel.findByIdAndDelete(
      req.params.id
    );

    if (!deletedFavorite) {
      return res.status(404).send({
        success: false,
        message: "Favorite not found",
      });
    }

    return res.status(200).send({
      success: true,
      message: "Favorite deleted successfully",
    });
  } catch (err) {
    return res.status(500).send({
      success: false,
      message: err.message || "Internal server error",
    });
  }
}
