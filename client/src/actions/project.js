"use server";

import { useAuthFetch } from "@/utils/api";
import { regex } from "@/utils/regex";
import { revalidateTag } from "next/cache";
import { cookies } from "next/headers";

export async function saveProject(t, prevState, formData) {
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
    console.log(err.message || t("project.create.error"));
    return {
      status: "failure",
      message: err.message,
    };
  }
}

export async function sendProjectInvitationToGuest(
  projectId,
  t,
  prevState,
  formData
) {
  try {
    const email = formData.get("email");
    const validation = regex.email.test(email);

    if (!validation) {
      return {
        status: "failure",
        message: t("common.error"),
        errors: {
          email: [t("auth.validation.email.invalid")],
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
      message: t("project_invitation.send.success", { email }),
      data: response?.data,
    };
  } catch (err) {
    console.log(err?.message || t("common.error"));

    if (err?.message.includes("E11000 duplicate")) {
      return {
        status: "failure",
        message: t("project_invitation.send.already_sent"),
        errors: null,
      };
    }

    return {
      status: "failure",
      message: err?.message || t("common.error"),
      errors: null,
    };
  }
}

export async function acceptProjectInvitation(invitationId, t) {
  const cookie = await cookies();
  try {
    if (!invitationId) {
      throw new Error(t("common.missing_parameter"));
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
      throw new Error(t("auth.not_connected"));
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
    console.log(err.message || t("common.error"));

    if (
      err?.message === t("auth.not_connected") ||
      err?.message === t("auth.user_not_exist")
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
      message: err.message || t("common.error"),
    };
  }
}

export async function removeGuest(projectId, t, prevState, formData) {
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
      message: t("project.guest.remove.success"),
      guestId: guestId,
    };
  } catch (err) {
    console.log(err.message || t("common.error"));

    return {
      status: "failure",
      message: err.message || t("common.error"),
    };
  }
}

export async function updateProject(t, prevState, formData) {
  try {
    const projectId = formData.get("project-id");
    const name = formData.get("project-name");
    const note = formData.get("note");
    const urls = formData.getAll("url");
    const icons = formData.getAll("icon");

    if (!name) {
      return {
        status: "failure",
        message: t("project.validation.name_required"),
      };
    }

    if (urls.length >= 1) {
      function isValidUrl(urls) {
        for (const url of urls) {
          if (!regex.url.test(url)) {
            return false;
          }

          return true;
        }
      }

      if (!isValidUrl(urls)) {
        return {
          status: "failure",
          message: t("project.validation.url_invalid"),
        };
      }
    }

    for (var i = 0; i < urls.length; i++) {
      if (urls[i] === "") {
        return {
          status: "failure",
          message: t("project.validation.url_empty"),
        };
      }
    }

    const urlsArray = urls.map((url, index) => ({
      icon: icons[index] || "Globe", // Utilise l'icône correspondante ou "Globe" par défaut
      url: url,
    }));

    const rawFormData = {
      name: name,
      note: note,
      urls: urlsArray,
    };

    const res = await useAuthFetch(
      `project/${projectId}`,
      "PUT",
      "application/json",
      rawFormData
    );

    const response = await res.json();

    console.log(response);

    if (!response.success) {
      throw new Error(response?.message);
    }

    revalidateTag("projects");

    return {
      status: "success",
      message: t("project.update.success"),
      data: response.data,
    };
  } catch (err) {
    console.log(err.message || t("project.update.error"));
    return {
      status: "failure",
      message: err.message,
    };
  }
}
