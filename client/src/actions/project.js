"use server";

import { useAuthFetch } from "@/utils/api";
import { regex } from "@/utils/regex";
import { revalidateTag } from "next/cache";
import { cookies } from "next/headers";

export async function saveProject(prevState, formData) {
  try {
    const rawFormData = {
      name: formData.get("project-name"),
    };

    const res = await useAuthFetch(
      `project`,
      "POST",
      "application/json",
      rawFormData
    );

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

    const res = await useAuthFetch(
      `project/${projectId}/send-invitation`,
      "POST",
      "application/json",
      rawData
    );

    const response = await res.json();

    if (!response.success) {
      throw new Error(response?.message);
    }

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
      message: err?.message || "Une erreur est survenue",
      errors: null,
    };
  }
}

export async function acceptProjectInvitation(invitationId) {
  const cookie = await cookies();
  try {
    if (!invitationId) {
      throw new Error("Paramètre manquant");
    }

    const rawData = {
      invitationId: invitationId,
    };

    const res = await useAuthFetch(
      `project/accept-invitation`,
      "PATCH",
      "application/json",
      rawData
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
    const guestId = formData.get("guest-id");

    if (!guestId) {
      return;
    }

    const rawData = {
      guestId: guestId,
    };

    const res = await useAuthFetch(
      `project/${projectId}/remove-guest`,
      "PATCH",
      "application/json",
      rawData
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
    const projectId = formData.get("project-id");
    const name = formData.get("project-name");
    const note = formData.get("note");
    // const urls = formData.getAll("url");
    // const icons = formData.getAll("icon");
    const websiteUrl = formData.get("website-url");
    const adminUrl = formData.get("admin-url");
    const figmaUrl = formData.get("figma-url");
    const githubUrl = formData.get("github-url");

    function isValidUrl(url) {
      return regex.url.test(url);
    }

    if (websiteUrl && !isValidUrl(websiteUrl)) {
      return {
        status: "failure",
        message: "L'URL du site web est invalide",
      };
    }

    if (adminUrl && !isValidUrl(adminUrl)) {
      return {
        status: "failure",
        message: "L'URL du back-office est invalide",
      };
    }

    if (figmaUrl && !isValidUrl(figmaUrl)) {
      return {
        status: "failure",
        message: "L'URL de Figma est invalide",
      };
    }

    if (githubUrl && !isValidUrl(githubUrl)) {
      return {
        status: "failure",
        message: "L'URL de Github est invalide",
      };
    }

    const urlsObject = {
      website: websiteUrl,
      admin: adminUrl,
      figma: figmaUrl,
      github: githubUrl,
    };

    // for (var i = 0; i < urls.length; i++) {
    //   if (urls[i] === "") {
    //     return {
    //       status: "failure",
    //       message: "L'URL ne peut pas être vide",
    //     };
    //   }
    // }

    // const urlsArray = urls.map((url, index) => ({
    //   icon: icons[index] || "Globe", // Utilise l'icône correspondante ou "Globe" par défaut
    //   url: url,
    // }));

    if (!name) {
      return {
        status: "failure",
        message: "Le nom du projet est obligatoire",
      };
    }

    const rawFormData = {
      name: name,
      note: note,
      urls: urlsObject,
    };

    // const urlWordpress = formData.get("url-wordpress");
    // const urlBackofficeWordpress = formData.get("url-backoffice-wordpress");

    // if (urlWordpress) {
    //   rawFormData.urlWordpress = urlWordpress;
    // }

    // if (urlBackofficeWordpress) {
    //   rawFormData.urlBackofficeWordpress = formData.get(
    //     "url-backoffice-wordpress"
    //   );
    // }

    const res = await useAuthFetch(
      `project/${projectId}`,
      "PUT",
      "application/json",
      rawFormData
    );

    const response = await res.json();

    if (!response.success) {
      throw new Error(response?.message);
    }

    revalidateTag("projects");

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

export async function updateProjectsOrder(projects) {
  try {
    const res = await useAuthFetch(
      `project/reorder`,
      "PATCH",
      "application/json",
      { projects }
    );

    const response = await res.json();
    return response; // Retourne la réponse complète
  } catch (err) {
    console.error("Erreur lors de la mise à jour de l'ordre des projets:", err);
    throw err; // Propage l'erreur pour la gestion dans handleDragEnd
  }
}
