"use client";
import { removeGuest } from "@/actions/project";
import { isNotEmpty, memberRole } from "@/utils/utils";
import Image from "next/image";
import {
  useActionState,
  useContext,
  useEffect,
  useState,
  useTransition,
} from "react";
import GuestFormInvitation from "../Projects/GuestFormInvitation";
import PopupMessage from "@/layouts/PopupMessage";
import { AuthContext } from "@/context/auth";
import { deleteProjectInvitation } from "@/actions/projectInvitation";
import { useUserRole } from "../../../hooks/useUserRole";
import { DropDown } from "../Dropdown/Dropdown";
import { useProjectInvitation } from "../../../hooks/useProjectInvitation";
import DisplayPicture from "../User/DisplayPicture";
import DropdownManage from "../Dropdown/DropdownManage";
import { leaveProject } from "@/api/project";
import { useRouter } from "next/navigation";
import { mutate } from "swr";
import ConfirmationKick from "../Popups/ConfirmationKick";
import ConfirmationLeave from "../Popups/ConfirmationLeave";
import Sidebar from "../Sidebar/Sidebar";

export default function GuestsModal({ project, setIsOpen, mutateProject }) {
  
  const initialState = {
    status: "pending",
    message: "",
    errors: null,
    guestId: null,
  };

  const { projectInvitations, mutateProjectInvitation } = useProjectInvitation(
    project?._id
  );
  const { uid } = useContext(AuthContext);
  const router = useRouter();
  const [isPopup, setIsPopup] = useState(null);
  const [isConfirmKickOpen, setIsConfirmKickOpen] = useState(false);
  const [isConfirmLeaveOpen, setIsConfirmLeaveOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [selectedMemberToLeave, setSelectedMemberToLeave] = useState(null);
  const removeGuestWithId = removeGuest.bind(null, project?._id);
  const [state, formAction, pending] = useActionState(
    removeGuestWithId,
    initialState
  );
  const [isPending, startTransition] = useTransition();
  const canInvite = useUserRole(project, ["owner", "manager"]);
  const canRemove = useUserRole(project, ["owner", "manager"]);
  const canEditRole = useUserRole(project, ["owner", "manager"]);

  const handleLeaveProject = async (projectId) => {
    const response = await leaveProject(projectId);

    if (!response?.success) {
      setIsPopup({
        status: "failure",
        title: "Une erreur s'est produite",
        message: response?.message,
      });

      return; // Arrêter l'exécution si l'opération a échoué
    }

    // Continuer seulement si l'opération a réussi
    await mutateProject();
    mutate("/favorite");
    router.push("/projects");
  };

  const handleConfirmLeave = () => {
    if (selectedMemberToLeave) {
      startTransition(async () => {
        await handleLeaveProject(project?._id);
      });
      setIsConfirmLeaveOpen(false);
      setSelectedMemberToLeave(null);
    }
  };

  const handleConfirmRemove = () => {
    if (selectedMember) {
      const formData = new FormData();
      formData.append("guest-id", selectedMember.user._id);
      startTransition(() => {
        formAction(formData);
      });
      setIsConfirmKickOpen(false);
      setSelectedMember(null);
    }
  };

  const members = project?.members;

  useEffect(() => {
    if (isPopup) {
      const timeout = setTimeout(() => {
        setIsPopup(null);
      }, 4000);

      return () => clearTimeout(timeout);
    }
  }, [isPopup]);

  useEffect(() => {
    if (state?.status === "success") {
      mutateProject();
      setIsPopup({
        status: state?.status,
        title: "Utilisateur révoqué avec succès",
        message: state?.message,
      });
    }

    if (state?.status === "failure" && state?.errors === null) {
      setIsPopup({
        status: state?.status,
        title: "Une erreur s'est produite",
        message: state?.message,
      });
    }
  }, [state]);

  const options = ["owner", "manager", "team", "customer", "guest"];

  return (
    <>
      <Sidebar
        isOpen={true}
        onClose={() => setIsOpen(false)}
        title="Gestion de l'équipe"
        width="500px"
      >
          <div>
            <h3 className="font-medium text-large mb-4">Inviter de nouveaux membres</h3>
            {canInvite && (
              <GuestFormInvitation
                project={project}
                setIsPopup={setIsPopup}
                mutateProjectInvitation={mutateProjectInvitation}
              />
            )}
          </div>
          
          {/* Membres existants */}
          {isNotEmpty(members) && (
            <div className="border-t border-color-border-color pt-5 [&_div]:flex [&_div]:justify-between [&_div]:items-center [&_div]:gap-2">
              <h3 className="font-medium text-large mb-4">Membres du projet</h3>
            <ul className="flex flex-col mt-4">
              {members.map((member, index) => {
                return (
                  <li
                    key={member?.user?._id}
                    className={`flex justify-between items-center gap-2 py-2.5 ${
                      index < members.length - 1 ? 'border-b border-color-border-color/30' : ''
                    }`}
                  >
                    <div className="[&_div]:justify-center">
                      <DisplayPicture
                        user={member?.user}
                        style={{ width: "32px", height: "32px" }}
                        className="rounded-full"
                      />
                      <div className="w-52 flex flex-col justify-start">
                        <span className="text-[14px] font-medium w-full leading-none">{member?.user?.firstName} {member?.user?.lastName}</span>
                      <span
                          className="overflow-hidden text-ellipsis select-all text-small leading-none w-full"
                        title={member?.user?.email}
                      >
                        {member?.user?.email}
                      </span>
                      </div>
                      {canEditRole &&
                      member?.user?._id !== uid &&
                      member?.role !== "owner" ? (
                        <DropDown
                          defaultValue={member?.role}
                          options={options}
                          project={project}
                          member={member}
                        />
                      ) : (
                        <div className="w-25 text-small">
                          <span
                            className={`w-full text-text-color-muted ${
                              canEditRole ? "text-center" : "text-left"
                            }`}
                          >
                            {memberRole(member?.role)}
                          </span>
                        </div>
                      )}
                    </div>
                    {canRemove && member?.role !== "owner" && member?.user?._id !== uid && (
                      <button
                        type="button"
                        data-disabled={pending || isPending}
                        disabled={pending || isPending}
                        onClick={() => {
                          setIsConfirmKickOpen(true);
                          setSelectedMember(member);
                        }}
                        className="rounded-sm p-2 text-small bg-danger-color h-8 hover:bg-text-color-red w-25"
                      >
                        Retirer
                      </button>
                    )}
                    {member?.user?._id === uid && (
                      <button
                        type="button"
                        data-disabled={pending || isPending}
                        disabled={pending || isPending}
                        onClick={() => {
                          setIsConfirmLeaveOpen(true);
                          setSelectedMemberToLeave(member);
                        }}
                        className="rounded-sm p-2 text-small bg-danger-color h-8 hover:bg-text-color-red w-25 "
                      >
                        Quitter
                      </button>
                    )}
                  </li>
                );
              })}
              </ul>
            </div>
          )}
          
          {/* Invitations en cours */}
          {isNotEmpty(projectInvitations) && canEditRole && (
            <div className="border-t border-color-border-color pt-5 [&_div]:flex [&_div]:justify-between [&_div]:items-center [&_div]:gap-2">
              <h3 className="font-medium text-large mb-4">
                Invitations en cours
              </h3>
              <ul className="flex flex-col">
                <ProjectInvitationsList
                  projectInvitations={projectInvitations}
                  setIsPopup={setIsPopup}
                  project={project}
                  mutateProjectInvitation={mutateProjectInvitation}
                  members={members}
                />
              </ul>
            </div>
          )}
      </Sidebar>
      
      {isPopup && (
        <PopupMessage
          status={isPopup?.status}
          title={isPopup?.title}
          message={isPopup?.message}
        />
      )}
      {isConfirmKickOpen && (
        <ConfirmationKick
          title={project?.name}
          member={selectedMember}
          onCancel={() => setIsConfirmKickOpen(false)}
          onConfirm={handleConfirmRemove}
        />
      )}
      {isConfirmLeaveOpen && (
        <ConfirmationLeave
          title={project?.name}
          member={selectedMemberToLeave}
          onCancel={() => setIsConfirmLeaveOpen(false)}
          onConfirm={handleConfirmLeave}
        />
      )}
    </>
  );
}

export function ProjectInvitationsList({
  projectInvitations,
  setIsPopup,
  project,
  mutateProjectInvitation,
  members,
}) {
  const initialState = {
    status: "pending",
    message: "",
  };

  const [state, formAction, pending] = useActionState(
    deleteProjectInvitation,
    initialState
  );
  const { uid } = useContext(AuthContext);

  const canDelete = useUserRole(project, ["owner", "manager"]);
  const canEditRole = useUserRole(project, ["owner", "manager"]);

  // Trouver le member correspondant à l'utilisateur actuel
  const currentMember = members?.find((member) => member?.user?._id === uid);
  useEffect(() => {
    if (state?.status === "success") {
      mutateProjectInvitation();
      setIsPopup({
        status: state?.status,
        title: "Invitation annulée avec succès",
        message: state?.message || "L'invitation a été annulée avec succès",
      });
    }
    if (state?.status === "failure") {
      setIsPopup({
        status: state?.status,
        title: "Une erreur s'est produite",
        message:
          state?.message ||
          "Une erreur s'est produite lors de l'annulation de l'invitation",
      });
    }
  }, [state]);

  return (
    <>
      {projectInvitations.map((inv, index) => (
        <li
          key={inv?._id}
          className={`flex justify-between items-center gap-2 text-text-color-muted py-3.5 ${
            index < projectInvitations.length - 1 ? 'border-b border-color-border-color/30' : ''
          } ${index === 0 ? 'mt-3' : ''}`}
        >
          <div>
            <div>
              <Image
                src={"/default/default-pfp.webp"}
                width={32}
                height={32}
                alt={`Photo de profil de ${inv?.guestEmail}`}
                className="rounded-full"
              />
              <span className="w-45 whitespace-nowrap overflow-hidden text-ellipsis">
                {inv?.guestEmail}
              </span>
            </div>
            <DropDown
              defaultValue={inv?.role}
              options={["owner", "manager", "team", "customer", "guest"]}
              invitation={inv}
              project={project}
            />
          </div>
          <DropdownManage
            project={project}
            setIsPopup={setIsPopup}
            mutateProjectInvitation={mutateProjectInvitation}
            formAction={formAction}
            pending={pending}
            inv={inv}
            currentMember={currentMember}
          />
        </li>
      ))}
    </>
  );
}
