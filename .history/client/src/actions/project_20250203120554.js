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
        Authorization: `Bearer ${session.value}`, // Pass the Access Token to authenticate the request
      },
      body: JSON.stringify(rawFormData),
    });

    const response = await res.json();

    console.log(response);

    revalidateTag("projects");

    return {
      status: "success",
    };
  } catch (err) {
    console.log(
      err.message || "Une erreur est survenue lors de la création du tableau"
    );
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
    };
  } catch (err) {
    console.log(err.message || "Une erreur est survenue");

    return {
      status: "failure",
      message: err.message || "Une erreur est survenue",
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
          Authorization: `Bearer ${session.value}`, // Pass the Access Token to authenticate the request
        },
        body: JSON.stringify(rawData),
      }
    );

    const response = await res.json();

    if (!response.success) {
      throw new Error(response?.message);
    }

    return response;
  } catch (err) {
    console.log(err.message || "Une erreur est survenue");

    return {
      status: "failure",
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
          Authorization: `Bearer ${session.value}`, // Pass the Access Token to authenticate the request
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
    };
  } catch (err) {
    console.log(err.message || "Une erreur est survenue");

    return {
      status: "failure",
      message: err.message || "Une erreur est survenue",
    };
  }
}

export async function updateProjectName(projectId, name) {
  try {
    const cookie = await cookies();
    const session = cookie.get("session");

    const rawFormData = {
      name: name,
    };

    const res = await fetch(`${process.env.API_URL}/project/${projectId}`, {
      method: "PUT",
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
    revalidateTag("project");

    return response;
  } catch (err) {
    console.log(
      err.message || "Une erreur est survenue lors de la modification du projet"
    );
    return {
      success: false,
      message: err.message,
    };
  }
}
