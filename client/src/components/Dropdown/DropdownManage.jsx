import { useUserRole } from '@/app/hooks/useUserRole';
import styles from "@/styles/components/timeTrackings/dropdown.module.css";
import React, { useActionState, useState } from 'react';
import { removeGuest } from "@/actions/project";
import { GuestFormResend } from '../Projects/GuestFormInvitation';
import { MoveRight, Plus, Settings, X } from 'lucide-react';

export default function DropdownManage({
    project,
    actions,
    inv,
    setIsPopup,
    mutateProjectInvitation,
    email,
}) {
    const { state, formAction, pending } = actions
    const [isOpen, setIsOpen] = useState(false);

    const handleIsOpen = () => {
        setIsOpen((prev) => !prev);
    };

    const canInvite = useUserRole(project, ["owner", "manager"]);
    const canDelete = useUserRole(project, ["owner", "manager"]);

    return (
        <>
            <div className={styles.container}>
                <button onClick={handleIsOpen} className={styles.manage}>
                    <Settings size={16} />
                    <span>Gérer</span>
                </button>
                {isOpen && (
                    <div className={styles.options}>
                        <ul>
                            <li className='animIconManage'>
                                {canDelete && (
                                    <form action={formAction}>
                                        <input
                                            type="text"
                                            name="project-invitation-id"
                                            id="project-invitation-id"
                                            defaultValue={inv?._id}
                                            hidden
                                        />
                                        <input
                                            type="text"
                                            name="project-id"
                                            id="project-id"
                                            defaultValue={inv?.projectId}
                                            hidden
                                        />
                                        <button
                                            type="submit"
                                            data-disabled={pending}
                                            disabled={pending}
                                        >
                                            <X size={16} className="iconManage" />
                                            <span>Annuler</span>
                                        </button>
                                    </form>
                                )}
                            </li>
                            <li className='animIconManage'>
                                {canInvite && (
                                    <GuestFormResend
                                        project={project}
                                        setIsPopup={setIsPopup}
                                        mutateProjectInvitation={mutateProjectInvitation}
                                        currentEmail={email}
                                    />
                                )}
                            </li>
                        </ul>
                    </div>
                )}

                {isOpen && <div id="modal-layout-opacity" onClick={handleIsOpen}></div>}
            </div>
        </>
    );
}
