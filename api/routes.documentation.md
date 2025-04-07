# 📊 Récapitulatif des Routes et Rôles Autorisés

## 📁 Projects

| Méthode | Endpoint                       | Contrôleur                         | Rôles Autorisés                           |
|---------|--------------------------------|------------------------------------|-------------------------------------------|
| POST    | `/`                            | `saveProject`                      | *(aucun checkRole)*                       |
| GET     | `/`                            | `getProjects`                      | *(aucun checkRole)*                       |
| GET     | `/:id`                         | `getProject`                       | owner, manager, team, customer, guest     |
| PUT     | `/:id`                         | `updateProject`                    | owner, manager                            |
| PATCH   | `/:id/logo`                    | `updateProjectLogo`                | owner, manager                            |
| DELETE  | `/:id`                         | `deleteProject`                    | owner                                     |
| POST    | `/:id/send-invitation`         | `sendProjectInvitationToGuest`     | owner, manager                            |
| PATCH   | `/accept-invitation`           | `acceptProjectInvitation`          | *(aucun checkRole)*                       |
| PATCH   | `/:id/update-role`             | `updateProjectRole`                | owner, manager                            |
| PATCH   | `/:id/remove-guest`            | `removeGuest`                      | owner, manager                            |
| PATCH   | `/reorder`                     | `updateProjectsOrder`              | *(aucun checkRole)*                       |

---

## ✅ Tasks

| Méthode | Endpoint                       | Contrôleur                         | Rôles Autorisés                           |
|---------|--------------------------------|------------------------------------|-------------------------------------------|
| POST    | `/`                            | `saveTask`                         | owner, manager, team, customer            |
| GET     | `/`                            | `getTasks`                         | owner, manager, team, customer, guest     |
| GET     | `/:id`                         | `getTask`                          | owner, manager, team, customer, guest     |
| PATCH   | `/:id/text`                    | `updateTaskText`                   | owner, manager, team, customer            |
| PATCH   | `/:id/status`                  | `updateTaskStatus`                 | owner, manager, team, customer            |
| PATCH   | `/:id/priority`                | `updateTaskPriority`               | owner, manager, team, customer            |
| PATCH   | `/:id/deadline`                | `updateTaskDeadline`               | owner, manager, team, customer            |
| PATCH   | `/:id/description`             | `updateTaskDescription`            | owner, manager, team, customer            |
| PATCH   | `/:id/add-responsible`         | `addResponsible`                   | owner, manager, team, customer            |
| PATCH   | `/:id/remove-responsible`      | `removeResponsible`                | owner, manager, team, customer            |
| PATCH   | `/:id/estimate`                | `updateTaskEstimation`             | owner, manager, team                      |
| PATCH   | `/:id/add-session`             | `addTaskSession`                   | owner, manager, team                      |
| PATCH   | `/:id/remove-session`          | `removeTaskSession`                | owner, manager, team                      |
| PATCH   | `/reorder`                     | `updateTaskOrder`                  | owner, manager, team                      |
| PATCH   | `/:id/update-board`            | `updateTaskBoard`                  | owner, manager, team                      |
| PATCH   | `/add-archive`                 | `addTaskToArchive`                 | owner, manager, team                      |
| PATCH   | `/remove-archive`              | `removeTaskFromArchive`            | owner, manager, team                      |
| DELETE  | `/`                            | `deleteTask`                       | owner, manager, team, customer            |

---

## 🗂️ Boards

| Méthode | Endpoint                       | Contrôleur                         | Rôles Autorisés                           |
|---------|--------------------------------|------------------------------------|-------------------------------------------|
| POST    | `/`                            | `saveBoard`                        | owner, manager, team, customer            |
| GET     | `/`                            | `getBoards`                        | owner, manager, team, customer, guest     |
| PUT     | `/:id`                         | `updateBoard`                      | owner, manager, team, customer            |
| PATCH   | `/:id/add-archive`             | `addBoardToArchive`                | owner, manager, team                      |
| PATCH   | `/:id/remove-archive`          | `removeBoardFromArchive`           | owner, manager, team                      |
| DELETE  | `/:id`                         | `deleteBoard`                      | owner, manager                            |

---

## ⏱️ Time Tracking

| Méthode | Endpoint                       | Contrôleur                         | Rôles Autorisés                           |
|---------|--------------------------------|------------------------------------|-------------------------------------------|
| POST    | `/`                            | `saveTimeTracking`                 | owner, manager, team                      |
| GET     | `/`                            | `getTimeTrackings`                 | owner, manager, team, customer, guest     |
| POST    | `/start`                       | `startTimer`                       | owner, manager, team                      |
| PATCH   | `/stop/:id`                    | `stopTimer`                        | owner, manager, team                      |
| DELETE  | `/`                            | `deleteTimeTracking`               | owner, manager, team                      |

---

## 💌 Project Invitations

| Méthode | Endpoint                       | Contrôleur                         | Rôles Autorisés                           |
|---------|--------------------------------|------------------------------------|-------------------------------------------|
| GET     | `/:projectId`                  | `getProjectInvitations`            | owner, manager, team, customer, guest     |
| DELETE  | `/:id`                         | `deleteProjectInvitation`          | owner, manager                            |

---

## 💬 Messages

| Méthode | Endpoint                       | Contrôleur                         | Rôles Autorisés                           |
|---------|--------------------------------|------------------------------------|-------------------------------------------|
| POST    | `/`                            | `saveMessage`                      | owner, manager, team, customer            |
| GET     | `/`                            | `getMessages`                      | owner, manager, team, customer, guest     |
| PUT     | `/:id`                         | `updateMessage`                    | owner, manager, team, customer            |
| DELETE  | `/:id`                         | `deleteMessage`                    | owner, manager, team, customer            |
