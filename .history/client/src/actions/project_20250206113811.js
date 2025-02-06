"use server";

import { regex } from "@/utils/regex";
import { signInSchema } from "@/utils/zod";
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
      data: response.data, // Contient le projet créé avec son _id
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

    console.log(response);

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
      message: "Une erreur est survenue",
      errors: null,
    };
  }
}

export async function acceptProjectInvitation(invitationId) {
  try {
    const cookie = await cookies();
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

    return response;
  } catch (err) {
    console.log(err.message || "Une erreur est survenue");

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

    revalidateTag("projects");

    return {
      status: "success",
      message: "Cet utilisateur a été révoqué avec succès",
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

    revalidateTag("projects");

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
      throw new Error(response?.message);
    }

    revalidateTag("projects");

    return {
      status: "success",
      data: response.data,
    };
  } catch (err) {
    return {
      status: "failure",
      message: err.message,
    };
  }
}
