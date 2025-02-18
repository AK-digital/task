"use server";

import { regex } from "@/utils/regex";
import { revalidateTag } from "next/cache";
import { cookies } from "next/headers";

export async function saveProject(prevState, formData) {
  try {
    const cookie = await cookies();
    const session = cookie.get("session");

    const rawFormData = {
      name: formData.get("project-name"),
    };

    const res = await fetch(`${process.env.API_URL}/project`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.value}`,
      },
      body: JSON.stringify(rawFormData),
    });

    const response = await res.json();

    if (!response.success) {
      throw new Error(response?.message);
    }

    revalidateTag("projects");

    return {
      status: "success",
      data: response.data,
    };
  } catch (err) {
    console.log(
      err.message || "Une erreur est survenue lors de la création du projet"
    );
    return {
      status: "failure",
      message: err.message,
    };
  }
}

export async function sendProjectInvitationToGuest(
  projectId,
  prevState,
  formData
) {
  try {
    const cookie = await cookies();
    const session = cookie.get("session");

    const email = formData.get("email");
    const validation = regex.email.test(email);

    if (!validation) {
      return {
        status: "failure",
        message: "Une erreur est survenue",
        errors: {
          email: ["L'adresse e-mail saisie est invalide"],
        },
      };
    }

    const rawData = {
      email: email,
    };

    const res = await fetch(
      `${process.env.API_URL}/project/${projectId}/send-invitation`,
      {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.value}`, // Pass the Access Token to authenticate the request
        },
        body: JSON.stringify(rawData),
      }
    );

    const response = await res.json();

    if (!response.success) {
      throw new Error(response?.message);
    }

    revalidateTag("project-invitations");

    return {
      status: "success",
      message: `Invitation envoyé à ${email} avec succès`,
      data: response?.data,
    };
  } catch (err) {
    console.log(err?.message || "Une erreur est survenue");

    if (err?.message.includes("E11000 duplicate")) {
      return {
        status: "failure",
        message: "Une invitation a déjà été envoyé à cet utilisateur",
        errors: null,
      };
    }

    return {
      status: "failure",
      message: "Une erreur est survenue",
      errors: null,
    };
  }
}

export async function acceptProjectInvitation(invitationId) {
  const cookie = await cookies();
  try {
    const session = cookie.get("session");

    if (!invitationId) {
      throw new Error("Paramètre manquant");
    }

    const rawData = {
      invitationId: invitationId,
    };

    const res = await fetch(
      `${process.env.API_URL}/project/accept-invitation`,
      {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.value}`, // Pass the Access Token to authenticate the request
        },
        body: JSON.stringify(rawData),
      }
    );

    if (res.status === 401) {
      throw new Error("L'utilisateur n'est pas connecté");
    }

    const response = await res.json();

    if (!response.success) {
      throw new Error(response?.message);
    }

    revalidateTag("project-invitations");
    revalidateTag("project");

    cookie.delete("invitationId", {
      secure: true,
      httpOnly: true,
      sameSite: "lax",
      path: "/",
    });

    return response;
  } catch (err) {
    console.log(err.message || "Une erreur est survenue");

    if (
      err?.message === "L'utilisateur n'est pas connecté" ||
      err?.message === "L'utilisateur n'existe pas"
    ) {
      cookie.set("invitationId", invitationId, {
        secure: true,
        httpOnly: true,
        sameSite: "lax",
        path: "/",
      });
    }

    return {
      success: false,
      message: err.message || "Une erreur est survenue",
    };
  }
}

export async function removeGuest(projectId, prevState, formData) {
  try {
    const cookie = await cookies();
    const session = cookie.get("session");

    const guestId = formData.get("guest-id");

    if (!guestId) {
      return;
    }

    const rawData = {
      guestId: formData.get("guest-id"),
    };

    const res = await fetch(
      `${process.env.API_URL}/project/${projectId}/remove-guest`,
      {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.value}`, // Pass the Access Token to authenticate the request
        },
        body: JSON.stringify(rawData),
      }
    );

    const response = await res.json();

    if (!response.success) {
      throw new Error(response?.message);
    }

    revalidateTag("project");

    return {
      status: "success",
      message: "Cet utilisateur a été révoqué avec succès",
      guestId: guestId,
    };
  } catch (err) {
    console.log(err.message || "Une erreur est survenue");

    return {
      status: "failure",
      message: err.message || "Une erreur est survenue",
    };
  }
}

export async function updateProject(prevState, formData) {
  try {
    const cookie = await cookies();
    const session = cookie.get("session");
    const projectId = formData.get("project-id");
    const name = formData.get("project-name");

    if (!name) {
      return {
        status: "failure",
        message: "Le nom du projet est obligatoire",
      };
    }

    const rawFormData = {
      name: name,
    };

    const urlWordpress = formData.get("url-wordpress");
    const urlBackofficeWordpress = formData.get("url-backoffice-wordpress");

    if (urlWordpress) {
      rawFormData.urlWordpress = urlWordpress;
    }

    if (urlBackofficeWordpress) {
      rawFormData.urlBackofficeWordpress = formData.get(
        "url-backoffice-wordpress"
      );
    }

    const res = await fetch(`${process.env.API_URL}/project/${projectId}`, {
      method: "PUT",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session?.value}`,
      },
      body: JSON.stringify(rawFormData),
    });

    const response = await res.json();

    if (!response.success) {
      throw new Error(response?.message);
    }

    revalidateTag("project");

    console.log(response);

    return {
      status: "success",
      message: "Le projet a été modifié avec succès",
      data: response.data,
    };
  } catch (err) {
    console.log(
      err.message || "Une erreur est survenue lors de la modification du projet"
    );
    return {
      status: "failure",
      message: err.message,
    };
  }
}

export async function updateProjectLogo(prevState, formData) {
  try {
    const cookie = await cookies();
    const session = cookie?.get("session");
    const projectId = formData.get("project-id");
    const logo = formData.get("logo");

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

    const res = await fetch(
      `${process.env.API_URL}/project/${projectId}/logo`,
      {
        method: "PATCH",
        credentials: "include",
        headers: {
          Authorization: `Bearer ${session.value}`,
        },
        body: formDataToSend,
      }
    );

    const response = await res.json();

    if (!response.success) {
      throw new Error(
        response?.message || "Une erreur inattendue est survenue"
      );
    }

    revalidateTag("projects");
    revalidateTag("project"); // Ajout de la revalidation du tag project

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

export async function updateProjectsOrder(projects) {
  try {
    const cookie = await cookies();
    const session = cookie.get("session");

    const res = await fetch(`${process.env.API_URL}/project/reorder`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.value}`,
      },
      body: JSON.stringify({ projects }),
    });

    const response = await res.json();
    return response; // Retourne la réponse complète
  } catch (err) {
    console.error("Erreur lors de la mise à jour de l'ordre des projets:", err);
    throw err; // Propage l'erreur pour la gestion dans handleDragEnd
  }
}
