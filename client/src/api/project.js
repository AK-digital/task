import { useAuthFetch } from "@/utils/api";

export async function getProject(id) {
  try {
    const res = await useAuthFetch(
      `project/${id}`,
      "GET",
      "application/json",
      null
    );

    const response = await res.json();

    if (!response.success) {
      throw new Error(response?.message);
    }

    return response.data;
  } catch (err) {
    console.log(
      err.message ||
      "Une erreur est survenue lors de la récupération des projets"
    );
  }
}

export async function getProjects() {
  try {
    const res = await useAuthFetch(
      "project",
      "GET",
      "application/json",
      null,
      "projects"
    );

    const response = await res.json();

    if (!response.success) {
      throw new Error(response?.message);
    }

    return response.data;
  } catch (err) {
    console.log(
      err?.message ||
      "Une erreur est survenue lors de la récupération des projets"
    );
    return [];
  }
}

export async function updateProjectLogo(projectId, logo) {
  try {
    if (!logo || logo.size === 0) {
      return {
        status: "failure",
        message: "Aucun fichier sélectionné",
      };
    }

    // Vérification du type de fichier
    if (!logo.type.startsWith("image/")) {
      return {
        status: "failure",
        message: "Le fichier doit être une image",
      };
    }

    const formDataToSend = new FormData();
    formDataToSend.append("logo", logo);

    const res = await useAuthFetch(
      `project/${projectId}/logo`,
      "PATCH",
      "multipart/form-data",
      formDataToSend
    );

    const response = await res.json();

    if (!response.success) {
      throw new Error(
        response?.message || "Une erreur inattendue est survenue"
      );
    }

    return {
      status: "success",
      message: "Le logo a été mis à jour avec succès",
      data: response.data,
    };
  } catch (err) {
    console.error("Erreur lors de la mise à jour du logo :", err);
    return {
      status: "failure",
      message:
        "Une erreur inattendue est survenue lors de la mise à jour du logo",
    };
  }
}

export async function updateProjectRole(projectId, memberId, role) {
  try {
    const res = await useAuthFetch(
      `project/${projectId}/update-role`,
      "PATCH",
      "application/json",
      { memberId, role }
    );

    const response = await res.json();

    if (!response?.success) {
      throw new Error(
        response?.message || "Une erreur inattendue est survenue"
      );
    }

    return response;
  } catch (err) {
    console.log(
      err?.message || "Une erreur est survenue lors de la mise à jour du rôle"
    );

    return {
      status: "failure",
      message: err?.message || "Une erreur est survenue lors de la mise à jour",
    };
  }
}

export async function leaveProject(projectId) {
  try {
    const res = await useAuthFetch(
      `project/${projectId}/leave-project`,
      "PATCH",
      "application/json",
      null
    );

    const response = await res.json();

    if (!response.success) {
      throw new Error(response?.message);
    }

    return response;
  } catch (err) {
    console.log(
      err?.message || "Une erreur est survenue lors de la sortie du projet"
    );

    return {
      success: false,
      message: err?.message || "Une erreur est survenue lors de la sortie du projet"
    };
  }
}

export async function deleteProject(projectId) {
  try {
    const res = await useAuthFetch(`project/${projectId}`, "DELETE");

    const response = await res.json();

    if (!response.success) {
      throw new Error(response?.message);
    }

    return response;
  } catch (err) {
    console.log(
      err?.message ||
      "Une erreur est survenue lors de la suppression du projet"
    );

    return {
      success: false,
      message: err?.message || "Une erreur est survenue lors de la suppression du projet"
    };
  }
}

export async function exportProject(projectId) {
  try {
    const res = await useAuthFetch(
      `project/${projectId}/export`,
      "GET",
      "application/json",
      null
    );

    const response = await res.json();

    if (!response.success) {
      throw new Error(response?.message);
    }

    return response;
  } catch (err) {
    console.log(
      err?.message || "Une erreur est survenue lors de l'export du projet"
    );

    return {
      success: false,
      message: err?.message || "Une erreur est survenue lors de l'export du projet"
    };
  }
}

export async function importProject(projectData) {
  try {
    const res = await useAuthFetch(
      "project/import",
      "POST",
      "application/json",
      { projectData }
    );

    const response = await res.json();

    if (!response.success) {
      throw new Error(response?.message);
    }

    return response;
  } catch (err) {
    console.log(
      err?.message || "Une erreur est survenue lors de l'import du projet"
    );

    return {
      success: false,
      message: err?.message || "Une erreur est survenue lors de l'import du projet"
    };
  }
}

export async function revalidatePage() {
  // Cette fonction n'est plus nécessaire côté client
  // La revalidation se fait maintenant via SWR
}
