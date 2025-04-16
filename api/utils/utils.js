import MessageModel from "../models/Message.model.js";

export function getMatches(string, regex) {
  return [...string.matchAll(regex)];
}

export async function deleteReaction(message, userId) {
  try {
    const reactions = message?.reactions || {};
    let updatedMessage = message;

    for (const reaction in reactions) {
      const users = reactions[reaction];

      if (Array.isArray(users) && users.includes(userId)) {
        updatedMessage = await MessageModel.findByIdAndUpdate(
          { _id: message._id },
          {
            $pull: { [`reactions.${reaction}`]: userId },
          },
          {
            new: true,
            setDefaultsOnInsert: true,
          }
        );
        break;
      }
    }

    return updatedMessage;
  } catch (err) {
    throw new Error("Erreur lors de la suppression de la réaction : " + err.message);
  }
}